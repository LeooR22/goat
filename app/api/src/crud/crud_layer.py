from typing import Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from .base import CRUDBase
from src.db.models.layer import Layer
from .crud_content import content as crud_content
from src.schemas.layer import LayerRead
from src.db.models.content import Content


from sqlalchemy import select


class CRUDLayer(CRUDBase):
    async def create(self, db, *, obj_in):
        content = await crud_content.create(db, obj_in=obj_in, content_type="layer")
        obj_in = Layer(**obj_in.dict())
        obj_in.content_id = content.id
        layer = await super().create(db, obj_in=obj_in)
        layer = layer.__dict__
        layer.update(content.__dict__)
        layer = LayerRead(**layer)
        return layer
    
    async def create_layer(self, *, obj_in, db: AsyncSession | None = None, id):
        db = db or super().get_db().session
        content = await crud_content.create(db, obj_in=obj_in, content_type="layer")
        obj_in = Layer(**obj_in.dict())
        obj_in.content_id = content.id
        layer = await super().create(db, obj_in=obj_in)
        layer = layer.__dict__
        layer.update(content.__dict__)
        layer = LayerRead(**layer)
        return layer

    async def get(self, db, *, id):
        statement = select([Layer, Content]).join(Content).where(Layer.content_id == str(id))
        layer = await db.execute(statement)
        layer = layer.fetchone()
        layer_dict = layer.Layer.__dict__
        layer_dict.update(layer.Content.__dict__)
        return layer_dict

    async def update(self, db, *, db_obj, obj_in):
        content_db_obj = await crud_content.get(db, id=str(obj_in.content_id))
        content_in = Content(**obj_in.dict())
        content = await crud_content.update(db, db_obj=content_db_obj, obj_in=content_in)
        db_obj = select(Layer).where(Layer.content_id == str(obj_in.content_id))
        db_obj = await db.execute(db_obj)
        db_obj = db_obj.fetchone()[0]
        obj_in = Layer(**obj_in.dict())
        layer = await super().update(db, db_obj=db_obj, obj_in=obj_in)
        layer = layer.__dict__
        layer.update(content.__dict__)
        return layer

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        extra_fields: List[Any] = ...,
        ordering: str = None,
        query: str = None,
    ):
        statement = select([Layer, Content]).join(Content).offset(skip).limit(limit)
        statement = self.order_by(statement, ordering)
        statement = self.search(statement, query)
        layers = await db.execute(statement)
        layers = layers.fetchall()
        layers_ = []
        for layer in layers:
            layer_dict = layer.Layer.__dict__
            layer_dict.update(layer.Content.__dict__)
            # layers_.append(LayerRead(**layer_dict))
            layers_.append(layer_dict)
        return layers_
    


    async def get_layer(self, *, db: AsyncSession | None = None, id) -> Layer | None:
        db = db or super().get_db().session
        statement = select(Layer).where(Layer.content_id == str(id))
        layer = await db.execute(statement)
        layer = layer.scalar_one_or_none()
        return layer
    
    async def create_layer_v2(self, *, layer_in: dict, content_id: str, db: AsyncSession | None = None) -> Layer:
        db = db or self.db.session
        new_layer = Layer(**layer_in)
        new_layer.content_id = content_id
        layer = await super().create(obj_in=new_layer)
        return layer
    

    async def add_content_to_layer(self, *, content_in: Content, layer_in: Layer, db: AsyncSession | None = None) -> Content:
        db = db or self.db.session
        layer_in.content = content_in
        db.session.add(content_in)
        await db.session.commit()
        await db.session.refresh(content_in)
        return content_in

layer = CRUDLayer(Layer)

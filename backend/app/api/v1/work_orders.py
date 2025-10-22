"""
作業案件API エンドポイント
"""

from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.database import WorkOrder

router = APIRouter()


# Pydanticスキーマ
class WorkOrderCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    address: str
    building_type: Optional[str] = None
    model: str
    quantity: int = 1
    scheduled_date: date
    worker_id: Optional[str] = None


class WorkOrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    address: Optional[str] = None
    building_type: Optional[str] = None
    model: Optional[str] = None
    quantity: Optional[int] = None
    scheduled_date: Optional[date] = None
    worker_id: Optional[str] = None
    status: Optional[str] = None


class WorkOrderResponse(BaseModel):
    id: str
    customer_name: str
    customer_phone: Optional[str]
    address: str
    building_type: Optional[str]
    model: str
    quantity: int
    scheduled_date: date
    worker_id: Optional[str]
    status: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[WorkOrderResponse])
async def get_work_orders(
    status: Optional[str] = Query(None),
    date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """作業案件一覧取得"""
    query = select(WorkOrder)

    if status:
        query = query.where(WorkOrder.status == status)
    if date:
        query = query.where(WorkOrder.scheduled_date == date)

    result = await db.execute(query.order_by(WorkOrder.scheduled_date))
    work_orders = result.scalars().all()

    return [
        WorkOrderResponse(
            id=str(wo.id),
            customer_name=wo.customer_name,
            customer_phone=wo.customer_phone,
            address=wo.address,
            building_type=wo.building_type,
            model=wo.model,
            quantity=wo.quantity,
            scheduled_date=wo.scheduled_date,
            worker_id=str(wo.worker_id) if wo.worker_id else None,
            status=wo.status,
            created_at=wo.created_at.isoformat(),
            updated_at=wo.updated_at.isoformat(),
        )
        for wo in work_orders
    ]


@router.get("/{work_order_id}", response_model=WorkOrderResponse)
async def get_work_order(
    work_order_id: str,
    db: AsyncSession = Depends(get_db),
):
    """作業案件詳細取得"""
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == work_order_id))
    work_order = result.scalar_one_or_none()

    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")

    return WorkOrderResponse(
        id=str(work_order.id),
        customer_name=work_order.customer_name,
        customer_phone=work_order.customer_phone,
        address=work_order.address,
        building_type=work_order.building_type,
        model=work_order.model,
        quantity=work_order.quantity,
        scheduled_date=work_order.scheduled_date,
        worker_id=str(work_order.worker_id) if work_order.worker_id else None,
        status=work_order.status,
        created_at=work_order.created_at.isoformat(),
        updated_at=work_order.updated_at.isoformat(),
    )


@router.post("/", response_model=WorkOrderResponse, status_code=201)
async def create_work_order(
    work_order_data: WorkOrderCreate,
    db: AsyncSession = Depends(get_db),
):
    """作業案件作成"""
    work_order = WorkOrder(**work_order_data.model_dump())
    db.add(work_order)
    await db.commit()
    await db.refresh(work_order)

    return WorkOrderResponse(
        id=str(work_order.id),
        customer_name=work_order.customer_name,
        customer_phone=work_order.customer_phone,
        address=work_order.address,
        building_type=work_order.building_type,
        model=work_order.model,
        quantity=work_order.quantity,
        scheduled_date=work_order.scheduled_date,
        worker_id=str(work_order.worker_id) if work_order.worker_id else None,
        status=work_order.status,
        created_at=work_order.created_at.isoformat(),
        updated_at=work_order.updated_at.isoformat(),
    )


@router.patch("/{work_order_id}", response_model=WorkOrderResponse)
async def update_work_order(
    work_order_id: str,
    work_order_data: WorkOrderUpdate,
    db: AsyncSession = Depends(get_db),
):
    """作業案件更新"""
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == work_order_id))
    work_order = result.scalar_one_or_none()

    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")

    for key, value in work_order_data.model_dump(exclude_unset=True).items():
        setattr(work_order, key, value)

    await db.commit()
    await db.refresh(work_order)

    return WorkOrderResponse(
        id=str(work_order.id),
        customer_name=work_order.customer_name,
        customer_phone=work_order.customer_phone,
        address=work_order.address,
        building_type=work_order.building_type,
        model=work_order.model,
        quantity=work_order.quantity,
        scheduled_date=work_order.scheduled_date,
        worker_id=str(work_order.worker_id) if work_order.worker_id else None,
        status=work_order.status,
        created_at=work_order.created_at.isoformat(),
        updated_at=work_order.updated_at.isoformat(),
    )


@router.delete("/{work_order_id}", status_code=204)
async def delete_work_order(
    work_order_id: str,
    db: AsyncSession = Depends(get_db),
):
    """作業案件削除"""
    result = await db.execute(select(WorkOrder).where(WorkOrder.id == work_order_id))
    work_order = result.scalar_one_or_none()

    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")

    await db.delete(work_order)
    await db.commit()

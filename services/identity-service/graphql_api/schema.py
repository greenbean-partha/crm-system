import strawberry
from typing import List, Optional
from .models import Company

@strawberry.federation.type(keys=["id"])
class CompanyType:
    id: int
    name: str
    parent_id: int | None

@strawberry.type
class Query:
    @strawberry.field
    def companies(self) -> List[CompanyType]:
        return Company.objects.all()
schema = strawberry.federation.Schema(
    query=Query,
)
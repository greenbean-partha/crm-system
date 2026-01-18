import strawberry
from typing import List, Optional
from .models import Company

@strawberry.type
class CompanyType:
    id: int
    name: str
    parent_id: Optional[int]

@strawberry.type
class Query:
    @strawberry.field
    def companies(self) -> List[CompanyType]:
        return Company.objects.all()
schema = strawberry.Schema(query=Query)

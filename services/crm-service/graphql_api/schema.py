import strawberry
from typing import List
from .models import Lead

@strawberry.type
class LeadType:
    id: int
    name: str
    email: str
    status: str

@strawberry.type
class Query:
    @strawberry.field
    def leads(self) -> List[LeadType]:
        return Lead.objects.all()

schema = strawberry.Schema(query=Query)


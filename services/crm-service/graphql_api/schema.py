import strawberry
from typing import List
from .models import Lead
from .kafka import publish_lead_created

@strawberry.type
class LeadType:
    id: int
    name: str
    email: str
    status: str
    company_id: int

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_lead(self, name: str, email: str, company_id: int) -> LeadType:
        lead = Lead.objects.create(
            name=name,
            email=email,
            company_id=company_id,
            status="NEW",
        )
        publish_lead_created({
            "lead_id": lead.id,
        })
        return lead

@strawberry.type
class Query:
    @strawberry.field
    def leads(self) -> List[LeadType]:
        return Lead.objects.all()

schema = strawberry.Schema(query=Query, mutation=Mutation)

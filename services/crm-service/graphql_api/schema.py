import strawberry
from typing import List
from .models import Lead
from .kafka import publish_lead_created
import requests

@strawberry.federation.type(keys=["id"])
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
    def leads(self, company_id: int) -> List[LeadType]:
        import requests

        res = requests.post(
            "http://identity-service:8000/graphql/",
            json={
                "query": """
                query ($id: Int!) {
                companyScope(companyId: $id)
                }
                """,
                "variables": {"id": company_id},
            },
            timeout=5,
        )

        scope = res.json()["data"]["companyScope"]
        return Lead.objects.filter(company_id__in=scope)
schema = strawberry.federation.Schema(
    query=Query,
    mutation=Mutation,
)

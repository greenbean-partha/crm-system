import strawberry
from typing import List
from django.conf import settings
from .models import Lead

def get_company_ids_from_headers(info):
    # TEMP: provided by gateway 
    header = info.context.request.headers.get("x-company-ids", "")
    return [int(x) for x in header.split(",") if x]

@strawberry.type
class LeadType:
    id: int
    name: str
    email: str
    status: str
    company_id: int

@strawberry.type
class Query:
    @strawberry.field
    def leads(self, info) -> List[LeadType]:
        company_ids = get_company_ids_from_headers(info)
        qs = Lead.objects.all()
        if company_ids:
            qs = qs.filter(company_id__in=company_ids)
        return qs

schema = strawberry.Schema(query=Query)


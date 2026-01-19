import strawberry
from typing import List, Optional
from .models import Company

def collect_descendants(company: Company, acc: list[int]):
    for child in company.children.all():
        acc.append(child.id)
        collect_descendants(child, acc)

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
    @strawberry.field
    def company_scope(self, company_id: int) -> List[int]:
        """
        Returns company_id + all descendant company ids
        """
        root = Company.objects.get(id=company_id)
        ids = [root.id]
        collect_descendants(root, ids)
        return ids
schema = strawberry.federation.Schema(
    query=Query,
)

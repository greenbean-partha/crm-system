import { gql, useQuery, useMutation } from "@apollo/client";
import { useState } from "react";

const GET_COMPANIES = gql`
  {
    companies {
      id
      name
    }
  }
`;

const GET_LEADS = gql`
  query ($companyId: Int!) {
    leads(companyId: $companyId) {
      id
      name
      companyId
    }
  }
`;
const CREATE_LEAD = gql`
  mutation ($name: String!, $email: String!, $companyId: Int!) {
    createLead(name: $name, email: $email, companyId: $companyId) {
      id
    }
  }
`;

export default function App() {
  const [companyId, setCompanyId] = useState(
    localStorage.getItem("companyId") || ""
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: companyData } = useQuery(GET_COMPANIES);

  const {
    data: leadData,
    refetch: refetchLeads,
    } = useQuery(GET_LEADS, {
        variables: companyId ? { companyId: parseInt(companyId) } : undefined,
        skip: !companyId,
        fetchPolicy: "network-only",
    });
  const [createLead] = useMutation(CREATE_LEAD);

  const onCompanyChange = async (e) => {
    const id = e.target.value;
    setCompanyId(id);

    if (id) {
      localStorage.setItem("companyId", id);
    } else {
      localStorage.removeItem("companyId");
    }

    await refetchLeads();
  };

  const submit = async () => {
    if (!name || !email || !companyId) {
      alert("Please fill all fields");
      return;
    }

    await createLead({
      variables: {
        name,
        email,
        companyId: parseInt(companyId),
      },
    });

    setName("");
    setEmail("");
    await refetchLeads();
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Company</h2>

      <select value={companyId} onChange={onCompanyChange}>
        <option value="">Select company</option>
        {companyData?.companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {companyId && (
        <>
          <h2 style={{ marginTop: 30 }}>Leads</h2>

          {leadData?.leads.length === 0 && <p>No leads found.</p>}

          <ul>
            {leadData?.leads.map((l) => (
              <li key={l.id}>
                {l.name} (company {l.companyId})
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: 30 }}>Create Lead</h2>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", marginBottom: 10 }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", marginBottom: 10 }}
          />

          <button onClick={submit}>Create Lead</button>
        </>
      )}
    </div>
  );
}

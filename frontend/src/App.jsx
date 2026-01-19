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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: 40,
          maxWidth: 480,
          width: "100%",
        }}
      >
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 24,
          color: "#2d3748",
          textAlign: "center"
        }}>CRM System</h1>

        <div style={{ marginBottom: 32 }}>
          <label htmlFor="company-select" style={{ fontWeight: 600, color: "#4a5568", marginBottom: 8, display: "block" }}>
            Company
          </label>
          <select
            id="company-select"
            value={companyId}
            onChange={onCompanyChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e0",
              fontSize: 16,
              background: "#f7fafc",
              marginTop: 4,
              marginBottom: 0,
              outline: "none",
              transition: "border-color 0.2s",
            }}
          >
            <option value="">Select company</option>
            {companyData?.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {companyId && (
          <>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#2b6cb0", marginBottom: 16 }}>Leads</h2>
              {leadData?.leads.length === 0 && (
                <p style={{ color: "#718096", fontStyle: "italic" }}>No leads found.</p>
              )}
              <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {leadData?.leads.map((l) => (
                  <li
                    key={l.id}
                    style={{
                      background: "#f7fafc",
                      borderRadius: 8,
                      padding: "10px 16px",
                      marginBottom: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                      color: "#2d3748",
                      fontWeight: 500,
                    }}
                  >
                    {l.name} <span style={{ color: "#718096", fontWeight: 400 }}>(company {l.companyId})</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#2b6cb0", marginBottom: 16 }}>Create Lead</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e0",
                    fontSize: 16,
                    background: "#f7fafc",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e0",
                    fontSize: 16,
                    background: "#f7fafc",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <button
                  onClick={submit}
                  style={{
                    padding: "12px 0",
                    borderRadius: 8,
                    background: "#2b6cb0",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(43,108,176,0.08)",
                    transition: "background 0.2s",
                  }}
                >
                  Create Lead
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

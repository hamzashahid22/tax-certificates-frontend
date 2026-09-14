import { useState, useEffect } from "react";
import "./CreateCertificate.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import UserModal from "../components/UserModal";
import {
  getUsers,
  createUser,
  getCompanies,
  getCertificates,
  createCertificate,
  getCertificateById,
} from "../services/api";

const TAX_YEARS = [
  "2024-2025",
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
];

const numberToWords = (num) => {
  if (!num || num === 0) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    let r = "";
    if (n >= 100) { r += ones[Math.floor(n / 100)] + " Hundred "; n %= 100; if (n) r += "and "; }
    if (n >= 20) { r += tens[Math.floor(n / 10)] + " "; n %= 10; }
    if (n > 0) r += ones[n] + " ";
    return r;
  };
  const str = String(num);
  const [wholeStr, decimalStr] = str.split(".");
  let p = parseInt(wholeStr, 10) || 0;
  let r = "";
  if (p >= 1000000) { r += convert(Math.floor(p / 1000000)) + "Million"; p %= 1000000; r += p ? ", " : " "; }
  if (p >= 1000) { r += convert(Math.floor(p / 1000)) + "Thousand"; p %= 1000; r += p ? ", " : " "; }
  if (p > 0) r += convert(p);
  let result = r.trim().toUpperCase();
  if (decimalStr) {
    const decimalNum = parseInt(decimalStr.slice(0, 2).padEnd(2, "0"), 10);
    if (decimalNum > 0) {
      result += " AND " + convert(decimalNum).trim().toUpperCase() + " PAISA";
    }
  }
  return result;
};


const formatAmount = (amount) => amount ? Number(amount).toLocaleString("en-US") : "";

const getNextSerialNumber = (issueDate, certificates) => {
  const yearMonth = issueDate.replaceAll("-", "").slice(0, 6);
  if (!yearMonth) return "";

  const serialPrefix = `${yearMonth}-959`;
  const highestCounter = certificates.reduce((highest, certificate) => {
    const serialNumber = certificate.serialNumber || "";
    if (!serialNumber.startsWith(serialPrefix)) return highest;

    const counter = Number(serialNumber.slice(serialPrefix.length));
    return Number.isInteger(counter) && counter > highest ? counter : highest;
  }, 0);

  return `${serialPrefix}${highestCounter + 1}`;
};

// Keep editable controls on screen, but print text so browser widgets cannot alter the layout.
function CertificateInput({ label, value, onChange, display = value, numeric, allowDecimal, options, type = "text" }) {
  const filter = numeric ? (allowDecimal ? /[^0-9.]/g : /[^0-9]/g) : null;
  const props = { "aria-label": label, value, onChange: (event) => onChange(filter ? event.target.value.replace(filter, "") : event.target.value) };
  return <span className="certificate-editable">
    <span className="certificate-display">{display || "\u00a0"}</span>
    {options ? <select {...props}><option value="">Select</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select>
      : <input {...props} type={type} inputMode={numeric ? "numeric" : undefined} />}
  </span>;
}

function CertificateRow({ top, label, children, unlined = false, className = "" }) {
  return <div className={`certificate-row ${className}`} style={{ top: `${top}pt` }}>
    <div className="certificate-label">{label}</div>
    <div className={unlined ? "certificate-value" : "certificate-value certificate-line"}>{children || "\u00a0"}</div>
  </div>;
}

function CreateCertificate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [taxYear, setTaxYear] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [value, setValue] = useState("");
  const [section, setSection] = useState("236 of the Income Tax Ordinance, 2001");
  const [accountType, setAccountType] = useState("Internet Services");
  const [ntn, setNtn] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const selectedCompany = companies.find((c) => c.id === Number(selectedCompanyId));
  const selectedUser = users.find((u) => u.id === Number(selectedUserId));

  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    const company = companies.find((item) => item.id === Number(companyId));
    // HomeNet is stored as Home Vision in the company directory.
    const isHomeNet = /home[\s-]*(net|vision)/i.test(`${company?.name || ""} ${company?.logo || ""}`);
    setSelectedCompanyId(companyId);
    setAccountType(isHomeNet ? "CATV Service" : "Internet Services");
  };

  const fetchData = async () => {
    try {
      const [u, c, certificates] = await Promise.all([
        getUsers(),
        getCompanies(),
        getCertificates(),
      ]);
      setUsers(u.data);
      setCompanies(c.data);
      setCertificates(certificates.data);
    } catch {
      setSnackbar({ open: true, message: "Error fetching data", type: "error" });
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!id) return;
    const loadCertificate = async () => {
      try {
        const res = await getCertificateById(id);
        const cert = res.data;
        setSelectedCompanyId(cert.companyId?.toString() || "");
        setSelectedUserId(cert.userId?.toString() || "");
        setSerialNumber(cert.serialNumber || "");
        setTaxYear(cert.taxYear || "");
        setTaxAmount(cert.taxAmount?.toString() || "");
        setIssueDate(cert.issueDate || new Date().toISOString().split("T")[0]);
        setValue(cert.value?.toString() || "");
        setSection(cert.section || "236 of the Income Tax Ordinance, 2001");
        setAccountType(cert.accountType || "Internet Services");
        setNtn(cert.ntn || "");
      } catch {
        setSnackbar({ open: true, message: "Error loading certificate", type: "error" });
      }
    };
    loadCertificate();
  }, [id]);

  useEffect(() => {
    setSerialNumber(getNextSerialNumber(issueDate, certificates));
  }, [issueDate, certificates]);

  const handleAddUser = () => setUserModalOpen(true);

  const handleSaveUser = async (data) => {
    try {
      await createUser(data);
      setSnackbar({ open: true, message: "User created successfully", type: "success" });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: "Error creating user", type: "error" });
    }
  };

  const handleSave = async () => {
    if (!selectedCompanyId || !selectedUserId || !taxYear || !taxAmount || !issueDate || !value) {
      setSnackbar({ open: true, message: "Please fill all required fields", type: "error" });
      return;
    }
    try {
      await createCertificate({
        serialNumber, companyId: selectedCompanyId, userId: selectedUserId,
        taxYear, taxAmount, issueDate, value, section, accountType, ntn,
      });
      setSnackbar({ open: true, message: "Certificate created successfully", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setSnackbar({ open: true, message: "Error creating certificate", type: "error" });
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const selectedPeriod = taxYear
      ? `Jul-${taxYear.split("-")[0]} To Jun-${taxYear.split("-")[1]}`
      : "Tax Certificate";
    const pdfFileName = `${selectedUser?.name || "Certificate"}-(${selectedPeriod})`
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
      .trim();

    document.title = pdfFileName;
    window.addEventListener("afterprint", () => {
      document.title = originalTitle;
    }, { once: true });
    window.print();
  };

  return (
    <>
      <style>{"@media print { @page { size: A4 portrait; margin: 0; } }"}</style>
      <div className="no-print">
        <Navbar onAddUser={handleAddUser} />
      </div>

      <div className="certificate-workspace py-8 print:py-0 min-h-screen flex flex-col items-center" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)" }}>
        {/* Control Bar */}
        <div className="flex justify-center mb-6 no-print w-full px-4">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</label>
              <select value={selectedCompanyId} onChange={handleCompanyChange}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium min-w-[280px]">
                <option value="">Select Company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">User</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium min-w-[250px]">
                <option value="">Select User</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} - {u.cnic}</option>)}
              </select>
            </div>
            <button onClick={handleAddUser}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        <div className="certificate-scroll">
          <article className="certificate-paper" aria-label="Income tax certificate">
            <div className="certificate-logo">
              {selectedCompany?.logo && <img src={`/company-logos/${selectedCompany.logo}`} alt={selectedCompany.name} />}
            </div>
            <h1 className="certificate-title">CERTIFICATE U/S 164 OF THE INCOME TAX ORDINANCE, 2001</h1>
            <div className="certificate-serial">S.No. {serialNumber}</div>
            <div className="certificate-original">Original/Duplicate</div>

            <CertificateRow top={174.5} label="Certified that the sum of Rupees">
              <CertificateInput label="Tax amount" value={taxAmount} onChange={setTaxAmount} numeric allowDecimal display={formatAmount(taxAmount)} />
            </CertificateRow>
            <CertificateRow top={192.5} label="In Words" className="certificate-words">
              {taxAmount ? numberToWords(Number(taxAmount)) : " "}
            </CertificateRow>
            <div className="certificate-person-label">on account of income tax has been deducted/collected from (Name and Address of the person from whom tax collected/deducted)</div>
            <div className="certificate-person-name certificate-line">{selectedUser?.name || " "}</div>
            <div className="certificate-person-address certificate-line">{selectedUser?.address || " "}</div>
            <div className="certificate-person-note">in case of an individual, his/her name in full and in<br />case of an association of persons / company, name and<br />style of the association of persons/company</div>

            <CertificateRow top={416.1} label="having National Tax Number" unlined>{selectedUser?.ntn || " "}</CertificateRow>
            <CertificateRow top={433.7} label="holder of CNIC No.">{selectedUser?.cnic || " "}</CertificateRow>
            <CertificateRow top={451.4} label="on" unlined />
            <CertificateRow top={469} label="Or during the period from">
              <CertificateInput label="Tax year" value={taxYear} onChange={setTaxYear} options={TAX_YEARS} display={taxYear ? `Jul-${taxYear.split("-")[0]} To Jun-${taxYear.split("-")[1]}` : ""} />
            </CertificateRow>
            <CertificateRow top={487} label="under section"><CertificateInput label="Section" value={section} onChange={setSection} /></CertificateRow>
            <CertificateRow top={505} label="On account of"><CertificateInput label="On account of" value={accountType} onChange={setAccountType} /></CertificateRow>
            <CertificateRow top={522.6} label="vide" unlined />
            <CertificateRow top={540.3} label="on the value/amount of Rupees">
              <CertificateInput label="Value amount" value={value} onChange={setValue} numeric allowDecimal display={formatAmount(value)} />
            </CertificateRow>
            <div className="certificate-declaration">This is to further certify that the tax collected/deducted has been deposited in the Federal Government<br />Account</div>
            <div className="certificate-company-heading">Company / office etc. collecting/deducting the tax:</div>
            <CertificateRow top={641.6} label="Name">{selectedCompany?.name || " "}</CertificateRow>
            <CertificateRow top={659.6} label="Address." className="certificate-company-address">{selectedCompany?.address || " "}</CertificateRow>
            <CertificateRow top={695.6} label="NTN (if any)">
              <CertificateInput label="NTN" value={ntn} onChange={setNtn} display={ntn || selectedCompany?.ntn || ""} />
            </CertificateRow>
            <CertificateRow top={713.2} label="Date"><CertificateInput label="Issue date" type="date" value={issueDate} onChange={setIssueDate} display={issueDate ? issueDate.split("-").reverse().join("/") : ""} /></CertificateRow>
            <div className="certificate-footer">Please note that this a computer generated document and does not require a signature</div>
          </article>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 mb-8 flex gap-3 no-print flex-wrap justify-center w-full max-w-4xl px-10">
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print Preview
          </button>
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-sm hover:shadow-md transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Save Certificate
          </button>
        </div>
      </div>

      <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} onSave={handleSaveUser} user={null} />

      {snackbar.open && (
        <div className={`no-print fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 flex items-center gap-2 ${
          snackbar.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>
          {snackbar.type === "error" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {snackbar.message}
        </div>
      )}
    </>
  );
}

export default CreateCertificate;

# FinAI Desk

**FinAI Desk** is an AI-enabled accounting web application designed for accountants, financial consultants and small businesses looking to streamline everyday financial tasks. Built with a clean and highly usable interface, it combines traditional accounting utilities with real-time AI suggestions to improve decision making and save time.

---

## 💡 Overview

FinAI Desk delivers **three core tools** in one intuitive platform:

### ✅ Depreciation Calculator
Easily manage fixed assets and automate depreciation schedules.  
- Add assets with name, category, value, purchase date and depreciation method  
- Get AI recommendations on whether to use SLM or WDV  
- Instantly calculate yearly depreciation and generate a 5-year forecast  
- Export an audit-ready report in PDF format

### ✅ Loan EMI & Amortization Scheduler  
Plan and visualise long-term loan commitments effortlessly.  
- Enter loan amount, interest rate and repayment tenure  
- View month-by-month EMI breakdown (principal + interest)  
- Receive AI suggestions for optimising tenure or renegotiating interest rates and view potential savings  
- Export amortization schedules in PDF or Excel format

### ✅ Tax Provision Estimator  
Estimate year-end tax obligations with AI-assisted optimisation.  
- Input annual taxable income and available deductions  
- Upload Form 16 to automatically extract and fill values  
- Let the AI suggest additional deduction opportunities based on your data  
- Generate a summary PDF for audit or compliance purposes  

---

## 🤖 AI Capabilities

FinAI Desk integrates with the **OpenRouter API** (model `openai/gpt-oss-20b:free`) to enhance user experience with intelligent features:

| Module                     | AI Support Provided |
|---------------------------|---------------------|
| Depreciation              | Method suggestions and forecast insights |
| EMI Scheduler             | Tenure / interest optimisation and savings estimation |
| Tax Provision             | Deduction suggestions and automated document data extraction |
| Chat Assistant            | Instant answers to questions like “How much EMI is due next month?” or “How do I reduce tax in Q3?” |

---

## 🖥️ User Interface

The application UI is built in Loveable (React + Tailwind) and designed to be clean, responsive, and fully accessible.  

The **homepage** contains a navigation bar with branding (favicon used as logo) and a single full-screen section explaining the app and its tools. A “Get Started” button directs users to the dashboard after login.

The **dashboard** provides:
- A concise summary of the user’s financial status
- Quick access to each of the three tools
- An embedded AI assistant for conversational queries

Every page is routed properly and returns users to the correct location after login or action completion. All tools are responsive and work flawlessly across desktop and mobile.

---

## 🔐 Security

All data operations are performed using a Supabase backend which already has its authentication and RLS policies in place. The OpenRouter API key is stored inside a Supabase Edge Function to ensure it is never exposed to the client.

---

## ✅ Summary

FinAI Desk combines a modern, polished UI with intelligent automation to help users:
- Save time on repetitive calculations  
- Make better financial decisions using AI suggestions  
- Export clean, audit-friendly reports  
- Access all financial tools from one interface

This project reflects a production-grade architecture and a real-world workflow used by professional accountants.

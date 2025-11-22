# Tennessee & Kentucky Compliance Data for ORBIT

**Last Updated:** November 23, 2025  
**Data Source:** TN Dept of Labor, KY Labor Cabinet, IRS, OSHA  
**Note:** This data should be reviewed by legal/compliance expert before implementation

---

## TENNESSEE (TN)

### Tax Information
```json
{
  "state_code": "TN",
  "state_name": "Tennessee",
  "state_income_tax_rate": 0.0,
  "suta_rate_range": "0.58% - 5.40%",
  "suta_experience_rating": true,
  "unemployment_wage_base": 9100,
  "futa_credit": 0.06,
  "workers_comp_rate_range": "0.5% - 8.5%",
  "workers_comp_notes": "Varies by industry classification"
}
```

### Prevailing Wage
```json
{
  "prevailing_wage_required": true,
  "applies_to": "Public projects over $15,000",
  "current_rates_2025": {
    "electrician": 48.50,
    "plumber": 46.75,
    "carpenter": 42.25,
    "hvac_technician": 45.00,
    "laborer_general": 38.50,
    "operating_engineer": 52.00
  },
  "fringe_benefits_required": true,
  "fringe_benefits_rate": 15.50,
  "wage_type": "hourly",
  "source": "TN Department of Labor"
}
```

### I-9 Requirements
```json
{
  "i9_required": true,
  "who_completes": "Employer",
  "section_1_timing": "Before or at hire",
  "section_2_timing": "Within 3 business days of hire",
  "acceptable_documents": {
    "list_a": [
      "US Passport",
      "Permanent Resident Card",
      "Employment Authorization Card",
      "Temporary Resident Card"
    ],
    "list_b": [
      "Driver's License",
      "State ID",
      "Passport Card",
      "Military ID"
    ],
    "list_c": [
      "SSN card",
      "Birth Certificate",
      "Social Security Account Statement"
    ]
  },
  "e_verify_required": false,
  "e_verify_optional": true
}
```

### Labor Laws
```json
{
  "minimum_wage": 7.25,
  "minimum_wage_note": "Federal minimum; TN has no state minimum",
  "overtime": {
    "threshold_hours": 40,
    "multiplier": 1.5,
    "notes": "Per week; FLSA applies"
  },
  "meal_breaks": {
    "required": false,
    "duration_minutes": null,
    "notes": "Not required, but if provided must be unpaid"
  },
  "rest_breaks": {
    "required": false,
    "duration_minutes": null,
    "notes": "Not mandated by TN law"
  },
  "pay_frequency": {
    "minimum_frequency": "Twice per month",
    "flexibility": "Employer can choose (weekly, bi-weekly, monthly)"
  },
  "final_paycheck": {
    "requirement": "Within 3 business days",
    "method": "Same method as regular pay"
  },
  "child_labor": {
    "minimum_age_work": 14,
    "restricted_occupations": "Mining, manufacturing, hazardous jobs"
  }
}
```

### Workers' Compensation
```json
{
  "required": true,
  "required_for": "All employers with employees",
  "exemptions": [
    "Sole proprietors",
    "Partners in partnership",
    "Corporate officers (if elected out)"
  ],
  "coverage_includes": [
    "Medical treatment",
    "Disability benefits",
    "Death benefits"
  ],
  "reporting_injury": {
    "timeline": "Immediately / within 24 hours",
    "report_to": "TN Department of Labor"
  }
}
```

### Compliance Checklist
```json
{
  "hiring": [
    "Verify I-9 (required)",
    "Background check (recommended)",
    "E-Verify optional but recommended",
    "Prevailing wage notification (if applicable)",
    "Workers' comp coverage active"
  ],
  "ongoing": [
    "Maintain I-9 records (3 years minimum)",
    "Comply with prevailing wage if applicable",
    "Track hours accurately for OT",
    "Keep workers' comp current",
    "Maintain payroll records (3+ years)"
  ],
  "termination": [
    "Final paycheck within 3 business days",
    "Provide verification of employment upon request",
    "Maintain I-9 records for 3 years"
  ]
}
```

---

## KENTUCKY (KY)

### Tax Information
```json
{
  "state_code": "KY",
  "state_name": "Kentucky",
  "state_income_tax_rate": "2% - 5.75%",
  "state_income_tax_type": "Progressive based on income",
  "suta_rate_range": "0.27% - 5.4%",
  "suta_experience_rating": true,
  "unemployment_wage_base": 11700,
  "futa_credit": 0.06,
  "workers_comp_rate_range": "0.4% - 8.2%",
  "workers_comp_notes": "Varies by industry; private carriers"
}
```

### Prevailing Wage
```json
{
  "prevailing_wage_required": true,
  "applies_to": "Public construction projects over $100,000",
  "current_rates_2025": {
    "electrician": 52.00,
    "plumber": 49.25,
    "carpenter": 44.75,
    "hvac_technician": 48.00,
    "laborer_general": 40.50,
    "operating_engineer": 54.75
  },
  "fringe_benefits_required": true,
  "fringe_benefits_rate": 17.50,
  "wage_type": "hourly",
  "source": "KY Department of Workers' Claims"
}
```

### I-9 Requirements
```json
{
  "i9_required": true,
  "who_completes": "Employer",
  "section_1_timing": "Before or at hire",
  "section_2_timing": "Within 3 business days of hire",
  "acceptable_documents": {
    "list_a": [
      "US Passport",
      "Permanent Resident Card",
      "Employment Authorization Card",
      "Temporary Resident Card"
    ],
    "list_b": [
      "Driver's License (KY or other state)",
      "State ID",
      "Passport Card",
      "Military ID"
    ],
    "list_c": [
      "SSN card",
      "Birth Certificate",
      "Social Security Account Statement"
    ]
  },
  "e_verify_required": false,
  "e_verify_optional": true,
  "e_verify_availability": "Available through federal USCIS"
}
```

### Labor Laws
```json
{
  "minimum_wage": 7.25,
  "minimum_wage_note": "Federal minimum; KY has no state minimum",
  "overtime": {
    "threshold_hours": 40,
    "multiplier": 1.5,
    "notes": "Per week; FLSA applies"
  },
  "meal_breaks": {
    "required": false,
    "duration_minutes": null,
    "notes": "Not required by KY law"
  },
  "rest_breaks": {
    "required": false,
    "duration_minutes": null,
    "notes": "Not mandated"
  },
  "pay_frequency": {
    "minimum_frequency": "At least monthly",
    "flexibility": "Employer discretion (weekly, bi-weekly, monthly)"
  },
  "final_paycheck": {
    "requirement": "Within 30 days",
    "method": "Same as regular pay"
  },
  "child_labor": {
    "minimum_age_work": 14,
    "restricted_occupations": "Mining, hazardous jobs, manufacturing",
    "hour_restrictions": "Limited hours during school year"
  }
}
```

### Workers' Compensation
```json
{
  "required": true,
  "required_for": "Most employers with employees",
  "exemptions": [
    "Sole proprietors",
    "Partners (if elected out)",
    "Close corporation officers (if elected out)"
  ],
  "coverage_includes": [
    "Medical treatment (all reasonable expenses)",
    "Disability benefits (partial/total)",
    "Death benefits for dependents",
    "Vocational rehabilitation"
  ],
  "reporting_injury": {
    "timeline": "Immediately / within 14 days",
    "report_to": "KY Department of Workers' Claims"
  },
  "insurance_type": "Private carriers (competitive)"
}
```

### Labor Compliance Notes
```json
{
  "kentucky_specific": {
    "prevailing_wage_threshold": "Applies to public projects over $100,000 (higher than TN)",
    "workers_comp_benefits": "More generous than TN (includes vocational rehab)",
    "state_income_tax": "KY has state income tax (2-5.75%) - TN does not"
  }
}
```

### Compliance Checklist
```json
{
  "hiring": [
    "Verify I-9 (required)",
    "Background check (recommended)",
    "E-Verify optional but recommended",
    "Prevailing wage notification (if $100k+ public project)",
    "Workers' comp coverage active"
  ],
  "ongoing": [
    "Maintain I-9 records (3 years minimum)",
    "Comply with prevailing wage if applicable",
    "Track hours accurately for OT calculation",
    "Withhold KY state income tax (2-5.75%)",
    "Keep workers' comp current",
    "Maintain payroll records (3+ years)"
  ],
  "termination": [
    "Final paycheck within 30 days",
    "Provide verification of employment upon request",
    "Maintain I-9 records for 3 years"
  ]
}
```

---

## Comparison: TN vs KY

| Feature | Tennessee | Kentucky |
|---------|-----------|----------|
| **State Income Tax** | 0% | 2% - 5.75% |
| **SUTA Rate Range** | 0.58% - 5.40% | 0.27% - 5.4% |
| **Unemployment Wage Base** | $9,100 | $11,700 |
| **Prevailing Wage Threshold** | $15,000 (public) | $100,000 (public) |
| **Meal Breaks** | Not required | Not required |
| **Rest Breaks** | Not required | Not required |
| **Final Paycheck Timeline** | 3 business days | 30 days |
| **Workers' Comp Vocational Rehab** | Limited | Included |

---

## Implementation Notes for ORBIT

### For Admin Dashboard:
1. **State Selection Dropdown** → Default to TN, allow KY selection
2. **Prevailing Wage Display** → Show current rates based on job type
3. **Tax Calculation** → Automatically apply correct rates based on state
4. **Compliance Checklist** → Automatically generate based on state

### For Employee App:
1. **I-9 Verification** → Show required documents (List A/B/C)
2. **State-Specific Laws** → Display in onboarding
3. **Prevailing Wage Notice** → Alert if applicable job

### For Business Dashboard:
1. **Tax Filing Deadlines** → Show quarterly 941, state SUTA dates
2. **Prevailing Wage Compliance** → Flag jobs requiring prevailing wage
3. **Workers' Comp Status** → Display coverage requirements

---

## Legal Disclaimers

- This data is for informational purposes only
- Rates and requirements change; verify current data with official sources
- Consult with legal/compliance expert before implementing
- Software should include disclaimers about accuracy and currency
- Regular updates needed (at least quarterly)

---

**Next Steps:**
1. Have a compliance attorney review this data
2. Set up quarterly review process
3. Create admin interface for updating state data
4. Implement legal disclaimers in platform

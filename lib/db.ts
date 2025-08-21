// Mock database for v0 preview - will use real PostgreSQL in Docker
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@gym.com",
    phone: "+1-555-0101",
    position: "Personal Trainer",
    salary: 45000,
    hire_date: "2023-01-15",
    status: "active",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2023-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@gym.com",
    phone: "+1-555-0102",
    position: "Fitness Instructor",
    salary: 42000,
    hire_date: "2023-02-01",
    status: "active",
    created_at: "2023-02-01T10:00:00Z",
    updated_at: "2023-02-01T10:00:00Z",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@gym.com",
    phone: "+1-555-0103",
    position: "Gym Manager",
    salary: 55000,
    hire_date: "2022-11-10",
    status: "active",
    created_at: "2022-11-10T10:00:00Z",
    updated_at: "2022-11-10T10:00:00Z",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@gym.com",
    phone: "+1-555-0104",
    position: "Receptionist",
    salary: 32000,
    hire_date: "2023-03-20",
    status: "active",
    created_at: "2023-03-20T10:00:00Z",
    updated_at: "2023-03-20T10:00:00Z",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@gym.com",
    phone: "+1-555-0105",
    position: "Maintenance",
    salary: 38000,
    hire_date: "2023-01-05",
    status: "inactive",
    created_at: "2023-01-05T10:00:00Z",
    updated_at: "2023-01-05T10:00:00Z",
  },
]

const mockFeeRecords: FeeRecord[] = [
  {
    id: 1,
    employee_id: 1,
    amount: 150.0,
    fee_type: "Uniform Fee",
    due_date: "2024-01-15",
    paid_date: "2024-01-10",
    status: "paid",
    description: "Annual uniform fee",
    created_at: "2023-12-15T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    employee_name: "John Smith",
    employee_email: "john.smith@gym.com",
  },
  {
    id: 2,
    employee_id: 2,
    amount: 75.0,
    fee_type: "Training Fee",
    due_date: "2024-02-01",
    status: "pending",
    description: "CPR certification training",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    employee_name: "Sarah Johnson",
    employee_email: "sarah.johnson@gym.com",
  },
  {
    id: 3,
    employee_id: 3,
    amount: 200.0,
    fee_type: "Equipment Fee",
    due_date: "2024-01-20",
    status: "overdue",
    description: "Damaged equipment replacement",
    created_at: "2023-12-20T10:00:00Z",
    updated_at: "2023-12-20T10:00:00Z",
    employee_name: "Mike Wilson",
    employee_email: "mike.wilson@gym.com",
  },
  {
    id: 4,
    employee_id: 4,
    amount: 50.0,
    fee_type: "Parking Fee",
    due_date: "2024-02-15",
    status: "pending",
    description: "Monthly parking fee",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    employee_name: "Emily Davis",
    employee_email: "emily.davis@gym.com",
  },
]

export const query = async (text: string, params?: any[]) => {
  console.log("[v0] Mock database query:", text, params)

  // Simulate database queries with mock data
  if (text.includes("SELECT") && text.includes("employees")) {
    return { rows: mockEmployees }
  }

  if (text.includes("SELECT") && text.includes("fee_records")) {
    return { rows: mockFeeRecords }
  }

  return { rows: [] }
}

export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  console.log("[v0] Mock SQL template query:", strings, values)

  const queryText = strings.join("?")

  // Handle employee queries
  if (queryText.includes("employees")) {
    let filteredEmployees = [...mockEmployees]

    // Apply search filter if present
    if (values.some((v) => typeof v === "string" && v.includes("%"))) {
      const searchTerm = values.find((v) => typeof v === "string" && v.includes("%"))?.replace(/%/g, "") || ""
      if (searchTerm) {
        filteredEmployees = mockEmployees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
    }

    // Apply status filter if present
    if (values.includes("active") || values.includes("inactive")) {
      const status = values.find((v) => v === "active" || v === "inactive")
      if (status) {
        filteredEmployees = filteredEmployees.filter((emp) => emp.status === status)
      }
    }

    return filteredEmployees
  }

  // Handle fee record queries
  if (queryText.includes("fee_records")) {
    let filteredFees = [...mockFeeRecords]

    // Apply status filter if present
    if (values.includes("pending") || values.includes("paid") || values.includes("overdue")) {
      const status = values.find((v) => ["pending", "paid", "overdue"].includes(v))
      if (status) {
        filteredFees = filteredFees.filter((fee) => fee.status === status)
      }
    }

    return filteredFees
  }

  return []
}

export const getFeeRecords = async (filters?: {
  search?: string
  status?: string
  type?: string
}) => {
  console.log("[v0] Mock getFeeRecords with filters:", filters)

  let filteredFees = [...mockFeeRecords]

  // Apply search filter
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredFees = filteredFees.filter(
      (fee) =>
        fee.employee_name?.toLowerCase().includes(searchTerm) ||
        fee.description?.toLowerCase().includes(searchTerm) ||
        fee.fee_type.toLowerCase().includes(searchTerm),
    )
  }

  // Apply status filter
  if (filters?.status) {
    filteredFees = filteredFees.filter((fee) => fee.status === filters.status)
  }

  // Apply type filter
  if (filters?.type) {
    filteredFees = filteredFees.filter((fee) => fee.fee_type === filters.type)
  }

  return filteredFees
}

// Database types
export interface AdminUser {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  name: string
  email: string
  phone?: string
  position: string
  salary: number
  hire_date: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface FeeRecord {
  id: number
  employee_id: number
  amount: number
  fee_type: string
  due_date: string
  paid_date?: string
  status: "pending" | "paid" | "overdue"
  description?: string
  created_at: string
  updated_at: string
  employee_name?: string
  employee_email?: string
}

export interface Reminder {
  id: number
  employee_id: number
  fee_record_id?: number
  message: string
  sent_at: string
  reminder_type: "payment_due" | "overdue_payment" | "general"
  created_at?: string
  employee_name?: string
  employee_email?: string
}

export interface Session {
  id: number
  session_token: string
  admin_user_id: number
  expires_at: string
  created_at: string
}

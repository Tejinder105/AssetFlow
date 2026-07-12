"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth"
import { useOrganizationStore } from "@/store/organization"

const statusBadgeClass = (status: string) =>
  status === "Active"
    ? "bg-[#007a5a]/10 hover:bg-[#007a5a]/10 text-[#007a5a] border-transparent font-normal rounded-full px-5 py-0.5 shadow-none"
    : "bg-muted hover:bg-muted text-muted-foreground border-transparent font-normal rounded-full px-5 py-0.5 shadow-none"

const tableMessage = (message: string, columns: number) => (
  <TableRow>
    <TableCell colSpan={columns} className="h-24 text-center text-muted-foreground">
      {message}
    </TableCell>
  </TableRow>
)

export default function OrganizationPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const departments = useOrganizationStore((state) => state.departments)
  const categories = useOrganizationStore((state) => state.categories)
  const employees = useOrganizationStore((state) => state.employees)
  const isLoading = useOrganizationStore((state) => state.isLoading)
  const error = useOrganizationStore((state) => state.error)
  const loadOrganization = useOrganizationStore((state) => state.loadOrganization)

  useEffect(() => {
    if (!accessToken) {
      router.push("/login")
      return
    }

    loadOrganization().catch(() => undefined)
  }, [accessToken, loadOrganization, router])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      <Tabs defaultValue="departments" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-transparent border-0 h-auto p-0 gap-3 justify-start overflow-x-auto">
            <TabsTrigger
              value="departments"
              className="px-6 py-2 rounded-md text-sm font-medium border border-border data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:border-primary bg-background text-muted-foreground data-[state=active]:shadow-none shadow-none"
            >
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="px-6 py-2 rounded-md text-sm font-medium border border-border data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:border-primary bg-background text-muted-foreground data-[state=active]:shadow-none shadow-none"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="px-6 py-2 rounded-md text-sm font-medium border border-border data-[state=active]:bg-secondary data-[state=active]:text-primary data-[state=active]:border-primary bg-background text-muted-foreground data-[state=active]:shadow-none shadow-none"
            >
              Employees
            </TabsTrigger>
          </TabsList>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-7 shadow-none font-bold">
            + Add
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <TabsContent value="departments" className="mt-4">
          <div className="rounded-md border border-border bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-b-border hover:bg-transparent">
                  <TableHead className="font-medium text-foreground h-10">Department</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Head</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Parent Dept</TableHead>
                  <TableHead className="font-medium text-foreground h-10 text-right pr-12">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && tableMessage("Loading departments...", 4)}
                {!isLoading && departments.length === 0 && tableMessage("No departments found", 4)}
                {!isLoading &&
                  departments.map((dept) => (
                    <TableRow key={dept.departmentId} className="border-b-border">
                      <TableCell className="font-medium text-foreground">{dept.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {dept.head?.name || "--"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dept.parent?.name || "--"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={statusBadgeClass(dept.status)}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="pt-6 border-t border-border mt-8">
            <p className="text-sm text-muted-foreground">
              Department records here drive picklists across assets and allocation flows.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="rounded-md border border-border bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-b-border hover:bg-transparent">
                  <TableHead className="font-medium text-foreground h-10">Category Name</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Description</TableHead>
                  <TableHead className="font-medium text-foreground h-10 text-right pr-12">Custom Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && tableMessage("Loading categories...", 3)}
                {!isLoading && categories.length === 0 && tableMessage("No categories found", 3)}
                {!isLoading &&
                  categories.map((cat) => (
                    <TableRow key={cat.categoryId} className="border-b-border">
                      <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cat.description || "--"}
                      </TableCell>
                      <TableCell className="text-right pr-12 text-muted-foreground">
                        {cat._count?.fields ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <div className="rounded-md border border-border bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-b-border hover:bg-transparent">
                  <TableHead className="font-medium text-foreground h-10">Name</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Email</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Department</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Role</TableHead>
                  <TableHead className="font-medium text-foreground h-10 text-right pr-12">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && tableMessage("Loading employees...", 5)}
                {!isLoading && employees.length === 0 && tableMessage("No employees found", 5)}
                {!isLoading &&
                  employees.map((emp) => (
                    <TableRow key={emp.userId} className="border-b-border">
                      <TableCell className="font-medium text-foreground">{emp.name}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.department?.name || "--"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{emp.role}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={statusBadgeClass(emp.status)}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

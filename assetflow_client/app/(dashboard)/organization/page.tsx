"use client"

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

const departments = [
  { id: 1, name: "Engineering", head: "aditi rao", parent: "--", status: "Active" },
  { id: 2, name: "Facilities", head: "rohan mehta", parent: "--", status: "Active" },
  { id: 3, name: "Field ops (east)", head: "sana iqbal", parent: "Field Ops", status: "Inactive" },
]

const categories = [
  { id: 1, name: "Electronics", type: "IT Asset", status: "Active" },
  { id: 2, name: "Furniture", type: "Office Supply", status: "Active" },
  { id: 3, name: "Vehicles", type: "Field Asset", status: "Active" },
]

const employees = [
  { id: 1, name: "Aditi Rao", email: "aditi@example.com", department: "Engineering", role: "Department Head", status: "Active" },
  { id: 2, name: "Rohan Mehta", email: "rohan@example.com", department: "Facilities", role: "Asset Manager", status: "Active" },
  { id: 3, name: "Sana Iqbal", email: "sana@example.com", department: "Field Ops", role: "Employee", status: "Inactive" },
]

export default function OrganizationPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
      <Tabs defaultValue="departments" className="flex flex-col gap-4">
        
        {/* Header and Tabs */}
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
              Employee
            </TabsTrigger>
          </TabsList>
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-7 shadow-none font-bold">
            + Add
          </Button>
        </div>

        {/* Content */}
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
                {departments.map((dept) => (
                  <TableRow key={dept.id} className="border-b-border">
                    <TableCell className="font-medium text-foreground">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground">{dept.head}</TableCell>
                    <TableCell className="text-muted-foreground">{dept.parent}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge 
                        variant="outline" 
                        className={
                          dept.status === "Active" 
                            ? "bg-[#007a5a]/10 hover:bg-[#007a5a]/10 text-[#007a5a] border-transparent font-normal rounded-full px-5 py-0.5 shadow-none" 
                            : "bg-muted hover:bg-muted text-muted-foreground border-transparent font-normal rounded-full px-5 py-0.5 shadow-none"
                        }
                      >
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
              Editing a department here also drives the picklist in Screen 4 & 5
            </p>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="rounded-md border border-border bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="border-b-border hover:bg-transparent">
                  <TableHead className="font-medium text-foreground h-10">Category Name</TableHead>
                  <TableHead className="font-medium text-foreground h-10">Type</TableHead>
                  <TableHead className="font-medium text-foreground h-10 text-right pr-12">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="border-b-border">
                    <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.type}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge 
                        variant="outline" 
                        className={
                          cat.status === "Active" 
                            ? "bg-[#007a5a]/10 hover:bg-[#007a5a]/10 text-[#007a5a] border-transparent font-normal rounded-full px-5 py-0.5 shadow-none" 
                            : "bg-muted hover:bg-muted text-muted-foreground border-transparent font-normal rounded-full px-5 py-0.5 shadow-none"
                        }
                      >
                        {cat.status}
                      </Badge>
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
                {employees.map((emp) => (
                  <TableRow key={emp.id} className="border-b-border">
                    <TableCell className="font-medium text-foreground">{emp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.department}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.role}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge 
                        variant="outline" 
                        className={
                          emp.status === "Active" 
                            ? "bg-[#007a5a]/10 hover:bg-[#007a5a]/10 text-[#007a5a] border-transparent font-normal rounded-full px-5 py-0.5 shadow-none" 
                            : "bg-muted hover:bg-muted text-muted-foreground border-transparent font-normal rounded-full px-5 py-0.5 shadow-none"
                        }
                      >
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

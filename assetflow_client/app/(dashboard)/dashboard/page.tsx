import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Today&apos;s Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">128</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">76</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">4</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">9</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Pending Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">3</div>
          </CardContent>
        </Card>

        <Card className="bg-muted/20 shadow-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Upcoming returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-medium">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-lg bg-red-100/50 border border-red-200 text-red-500 font-medium flex items-center">
        3 assets overdue for return - flagged for follow-up
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button size="lg" className="px-6 py-6 text-base bg-[#d5f3eb] hover:bg-[#b8e8db] text-zinc-900 border border-zinc-200 shadow-none">
          + register asset
        </Button>
        <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
          Book resource
        </Button>
        <Button variant="outline" size="lg" className="px-6 py-6 text-base shadow-none">
          Raise requests
        </Button>
      </div>

      {/* Recent Activity */}
      <section className="pt-4">
        <h3 className="text-xl font-medium mb-4">Recent Acivity</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <span className="font-medium mr-1 text-foreground">Laptop AF-0114</span>
            <span className="text-muted-foreground">- allocated to Priya shah - IT dept</span>
          </div>
          <div className="text-sm">
            <span className="font-medium mr-1 text-foreground">Room B2</span>
            <span className="text-muted-foreground">- booking confirmed - 2:00 to 3:00 PM</span>
          </div>
          <div className="text-sm">
            <span className="font-medium mr-1 text-foreground">Projector AF-0062</span>
            <span className="text-muted-foreground">- maintenance resolved</span>
          </div>
        </div>
      </section>
    </div>
  )
}

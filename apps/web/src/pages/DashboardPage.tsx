import type { ApplicationWithCandidate } from '@candidate-tracker/shared'

import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useDashboardStats } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function DashboardPage() {
    const { data, isLoading } = useDashboardStats()

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground">Loading...</div>
    }

    if (!data) {
        return <div className="p-10 text-center text-red-500">Failed to load dashboard!</div>
    }

    const stats = [
        {
            title: 'Total Candidates',
            value: data.totalCandidates,
            href: '/candidates'
        },
        {
            title: 'Total Applications',
            value: data.totalApplications,
            href: '/applications'
        },
        {
            title: 'Hired This Month',
            value: data.hiredThisMonth,
            href: '/applications?status=hired'
        },
        {
            title: 'Rejection Rate',
            value: `${data.rejectionRate}%`,
            href: '/applications?status=rejected'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Real-time insights into your hiring pipeline
                </p>
            </div>
            {/* Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Link key={i} to={stat.href}>
                        <Card className="hover:shadow-md transition cursor-pointer">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Status Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applications by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statusDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={4}
                                >
                                    {data.statusDistribution.map((_: any, index: number) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {/* Latest Applications */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Latest Applications</CardTitle>
                        <Link
                            to="/applications"
                            className="text-sm text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.latestApplications?.length === 0 && (
                                <p className="text-muted-foreground text-sm">
                                    No applications yet!
                                </p>
                            )}
                            {data.latestApplications?.map((app: ApplicationWithCandidate) => (
                                <div
                                    key={app.id}
                                    className="flex items-center justify-between border-b pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{app.candidate?.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {app.job_title} • {app.company}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold capitalize">
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
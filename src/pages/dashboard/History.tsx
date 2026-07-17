import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { analysisService } from "@/services/analysisService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskBadge } from "@/components/RiskBadge";
import { formatINR } from "@/utils/format";
import { Search, ArrowRight, Wheat, Trash2, Calendar, TrendingUp, BarChart3, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CROPS } from "@/constants/data";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

export function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["history"], queryFn: () => analysisService.getHistory() });
  
  const [q, setQ] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Date (Newest)");
  const [page, setPage] = useState(1);

  const historyData = data ?? [];

  const filteredAndSorted = useMemo(() => {
    let result = historyData.filter(h => h.crop.toLowerCase().includes(q.toLowerCase()));
    
    if (riskFilter !== "All") {
      result = result.filter(h => h.spoilage.risk_level === riskFilter);
    }
    if (actionFilter !== "All") {
      result = result.filter(h => h.recommendation.action === actionFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "Date (Newest)") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "Date (Oldest)") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "Profit (High to Low)") return b.recommendation.expected_profit - a.recommendation.expected_profit;
      if (sortBy === "Profit (Low to High)") return a.recommendation.expected_profit - b.recommendation.expected_profit;
      return 0;
    });

    return result;
  }, [historyData, q, riskFilter, actionFilter, sortBy]);

  const paginated = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE) || 1;

  // Chart data: count of analyses by crop
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    historyData.forEach(h => { counts[h.crop] = (counts[h.crop] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [historyData]);

  const handleDelete = async (id: string) => {
    await analysisService.deleteById(id);
    queryClient.invalidateQueries({ queryKey: ["history"] });
    toast.success("Analysis deleted");
  };

  const getEmoji = (cropName: string) => CROPS.find(c => c.name === cropName)?.emoji || "🌱";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and manage your past AI predictions and profit analyses.</p>
        </div>
      </div>

      {historyData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary"><BarChart3 className="h-6 w-6" /></div>
            <div><p className="text-sm text-muted-foreground">Total Analyses</p><p className="text-2xl font-bold">{historyData.length}</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 md:col-span-2">
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                  <XAxis dataKey="name" hide />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by crop name..." className="pl-9" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
          <Select value={riskFilter} onValueChange={v => { setRiskFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Risks</SelectItem>
              <SelectItem value="Green">Green (Low)</SelectItem>
              <SelectItem value="Yellow">Yellow (Med)</SelectItem>
              <SelectItem value="Red">Red (High)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Actions</SelectItem>
              <SelectItem value="Sell Now">Sell Now</SelectItem>
              <SelectItem value="Store Crop">Store Crop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Date (Newest)">Date (Newest)</SelectItem>
              <SelectItem value="Date (Oldest)">Date (Oldest)</SelectItem>
              <SelectItem value="Profit (High to Low)">Profit (High to Low)</SelectItem>
              <SelectItem value="Profit (Low to High)">Profit (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted"><Wheat className="h-8 w-8 text-muted-foreground" /></div>
            <p className="mt-4 font-medium text-foreground">No analyses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or run a new analysis.</p>
            {historyData.length === 0 && (
              <Button asChild className="mt-6"><Link to="/dashboard/new-analysis">Run your first analysis</Link></Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map(h => (
              <div key={h.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors group">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl shrink-0">
                  {getEmoji(h.crop)}
                </div>
                
                <div className="flex-1 grid gap-2 sm:grid-cols-4 items-center">
                  <div>
                    <h3 className="font-bold text-lg">{h.crop} <span className="text-sm font-normal text-muted-foreground">({h.quantity_kg} kg)</span></h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(h.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                    <Badge variant="outline" className={h.recommendation.action === "Store Crop" ? "border-primary text-primary bg-primary/5" : ""}>
                      {h.recommendation.action}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Risk & Confidence</p>
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={h.spoilage.risk_level} />
                      <span className="text-xs font-medium text-muted-foreground">{h.recommendation.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="sm:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Expected Profit</p>
                    <p className="font-bold text-emerald-600">{formatINR(h.recommendation.expected_profit)}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                  <Button size="sm" variant="default" className="w-full sm:w-auto" onClick={() => navigate(`/dashboard/result/${h.id}`)}>
                    <FileText className="mr-2 h-4 w-4" /> Report
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full sm:w-auto text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(h.id)}>
                    <Trash2 className="h-4 w-4 sm:mr-2" /> <span className="sm:hidden">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="text-sm font-medium px-2">Page {page} of {totalPages}</div>
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

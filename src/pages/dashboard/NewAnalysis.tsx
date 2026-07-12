import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Leaf, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const analysisCards = [
  {
    title: "Shelf-Life Prediction",
    description: "Predict the remaining safe storage life of harvested crops using AI.",
    route: "/dashboard/new-analysis/spoilage",
    buttonLabel: "Start Shelf-Life Analysis",
    icon: Leaf,
    accent: "from-emerald-500/20 via-background to-primary/10",
    glow: "bg-emerald-500/20",
  },
  {
    title: "Market Price Prediction",
    description: "Predict the expected mandi price after 15 days using the trained XGBoost model.",
    route: "/dashboard/new-analysis/price-prediction",
    buttonLabel: "Start Price Prediction",
    icon: TrendingUp,
    accent: "from-amber-500/20 via-background to-primary/10",
    glow: "bg-amber-500/20",
  },
];

export function NewAnalysis() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">New analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose an AI workflow to extend your current post-harvest decision making.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {analysisCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className="group relative overflow-hidden border-border/60 bg-card/90 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.glow}`}>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="border-primary/20 bg-primary/10 text-primary">AI</Badge>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button asChild className="gradient-primary text-primary-foreground">
                      <Link to={card.route}>
                        {card.buttonLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BrainCircuit className="h-4 w-4" />
                      Mock-ready for FastAPI
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

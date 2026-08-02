"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  LifeBuoy,
  MessageCircle,
  BookOpen,
  Mail,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const supportOptions = [
  {
    title: "Documentation",
    description: "Browse our comprehensive guides and API references",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    action: "View Docs",
    href: "#",
  },
  {
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    icon: MessageCircle,
    color: "from-emerald-500 to-teal-600",
    action: "Start Chat",
    href: "#",
  },
  {
    title: "Email Support",
    description: "Send us an email and we'll get back to you within 24h",
    icon: Mail,
    color: "from-amber-500 to-orange-600",
    action: "Send Email",
    href: "mailto:support@retailflow.com",
  },
  {
    title: "Help Center",
    description: "Find answers to common questions and issues",
    icon: LifeBuoy,
    color: "from-purple-500 to-pink-600",
    action: "Get Help",
    href: "#",
  },
]

const faqs = [
  {
    q: "How do I add a new product?",
    a: "Go to Inventory > Products and click 'Add Product'. Fill in the required details and save.",
  },
  {
    q: "How do I create a purchase order?",
    a: "Navigate to Purchases > Orders and click 'New Order'. Select a supplier, add items, and submit.",
  },
  {
    q: "How do I reset a user's password?",
    a: "Go to Settings > Users, find the user, and use the 'Reset Password' option.",
  },
  {
    q: "How do I generate a sales report?",
    a: "Go to Reports > Sales, select the date range, and generate the report.",
  },
]

export default function SupportPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Support"
        description="Get help and support for RetailFlow"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {supportOptions.map((option, i) => {
          const Icon = option.icon
          return (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card glass className="p-5 h-full flex flex-col">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{option.description}</p>
                <Button variant="outline" size="sm" className="w-full gap-1" asChild>
                  <a href={option.href} target={option.href.startsWith("http") ? "_blank" : undefined} rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                    {option.action}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card glass className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/40 p-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground text-sm">{faq.q}</p>
                  <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card glass className="p-6 text-center">
        <LifeBuoy className="h-10 w-10 text-primary mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Still need help?</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Our support team is available 24/7 to assist you</p>
        <div className="flex items-center justify-center gap-3">
          <Button><Mail className="h-4 w-4" /> Contact Support</Button>
          <Button variant="outline"><MessageCircle className="h-4 w-4" /> Start Live Chat</Button>
        </div>
      </Card>
    </div>
  )
}

import type { Template } from "@/types";

export const templates: Template[] = [
  {
    id: "tpl-001",
    name: "Monthly Payment Reminder",
    type: "payment_reminder",
    content:
      "Dear {{customer_name}}, this is a reminder that your installment of {{due_amount}} for {{group_name}} is due on {{due_date}}. Kindly pay at the earliest. - {{branch_name}}",
    variables: ["customer_name", "due_amount", "group_name", "due_date", "branch_name"],
    createdAt: "2024-01-10",
    updatedAt: "2026-05-02",
  },
  {
    id: "tpl-002",
    name: "Due Date Alert",
    type: "due_reminder",
    content:
      "Hello {{customer_name}}, your chit installment of {{due_amount}} for {{group_name}} is due on {{due_date}}. Please make the payment on time to avoid late fees.",
    variables: ["customer_name", "due_amount", "group_name", "due_date"],
    createdAt: "2024-01-10",
    updatedAt: "2026-03-18",
  },
  {
    id: "tpl-003",
    name: "Overdue Payment Warning",
    type: "overdue_warning",
    content:
      "Dear {{customer_name}}, your payment of {{due_amount}} for {{group_name}} is overdue since {{due_date}}. Please clear the dues immediately to avoid penalty charges. Contact {{branch_name}} for assistance.",
    variables: ["customer_name", "due_amount", "group_name", "due_date", "branch_name"],
    createdAt: "2024-02-05",
    updatedAt: "2026-04-22",
  },
  {
    id: "tpl-004",
    name: "Payment Receipt Confirmation",
    type: "receipt_message",
    content:
      "Dear {{customer_name}}, we have received your payment of {{due_amount}} for {{group_name}}. Receipt No: {{receipt_no}}. Thank you for your prompt payment.",
    variables: ["customer_name", "due_amount", "group_name", "receipt_no"],
    createdAt: "2024-01-15",
    updatedAt: "2026-06-01",
  },
  {
    id: "tpl-005",
    name: "Auction Schedule Notice",
    type: "auction_notification",
    content:
      "Dear {{customer_name}}, the auction for {{group_name}} is scheduled on {{due_date}} at our {{branch_name}} office. Your presence is requested.",
    variables: ["customer_name", "group_name", "due_date", "branch_name"],
    createdAt: "2024-03-01",
    updatedAt: "2026-05-20",
  },
  {
    id: "tpl-006",
    name: "New Chit Group Invitation",
    type: "new_group_invite",
    content:
      "Dear {{customer_name}}, we are launching a new chit group {{group_name}} at {{branch_name}}. Join now to secure your slot. Contact us for more details.",
    variables: ["customer_name", "group_name", "branch_name"],
    createdAt: "2024-06-10",
    updatedAt: "2026-02-14",
  },
  {
    id: "tpl-007",
    name: "Festival Greetings",
    type: "festival_greeting",
    content:
      "Dear {{customer_name}}, Shree Vaari Chit Finance wishes you and your family a very happy and prosperous festival season! - {{branch_name}}",
    variables: ["customer_name", "branch_name"],
    createdAt: "2024-09-01",
    updatedAt: "2026-01-05",
  },
  {
    id: "tpl-008",
    name: "Branch Announcement",
    type: "branch_announcement",
    content:
      "Dear {{customer_name}}, please note that our {{branch_name}} branch will have updated working hours starting {{due_date}}. Thank you for your continued trust.",
    variables: ["customer_name", "branch_name", "due_date"],
    createdAt: "2024-11-12",
    updatedAt: "2026-06-28",
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

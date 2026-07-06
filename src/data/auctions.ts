import type { Auction } from "@/types";
import { chitMembers } from "@/data/chit-members";
import { chitGroups } from "@/data/chit-groups";

function buildAuctions(): Auction[] {
  const auctions: Auction[] = [];
  let seq = 0;

  for (const group of chitGroups) {
    const winners = chitMembers
      .filter((m) => m.chitGroupId === group.id && m.hasWon && m.wonMonth)
      .sort((a, b) => (a.wonMonth ?? 0) - (b.wonMonth ?? 0));

    for (const w of winners) {
      seq += 1;
      const discountAmount = group.chitValue - (w.wonAmount ?? group.chitValue);
      auctions.push({
        id: `auc-${String(seq).padStart(4, "0")}`,
        chitGroupId: group.id,
        month: w.wonMonth ?? 1,
        auctionDate: w.joinedDate, // placeholder anchor, refined below per group cadence
        winnerCustomerId: w.customerId,
        bidAmount: w.wonAmount ?? group.chitValue,
        discountAmount,
        dividendPerMember: Math.round(discountAmount / group.totalMembers),
        status: "completed",
      });
    }

    if (group.status === "active" || group.status === "pending") {
      seq += 1;
      auctions.push({
        id: `auc-${String(seq).padStart(4, "0")}`,
        chitGroupId: group.id,
        month: winners.length + 1,
        auctionDate: group.auctionDate,
        winnerCustomerId: null,
        bidAmount: 0,
        discountAmount: 0,
        dividendPerMember: 0,
        status: "scheduled",
      });
    }
  }

  return auctions;
}

export const auctions: Auction[] = buildAuctions();

export function getAuctionsByGroup(chitGroupId: string): Auction[] {
  return auctions.filter((a) => a.chitGroupId === chitGroupId);
}

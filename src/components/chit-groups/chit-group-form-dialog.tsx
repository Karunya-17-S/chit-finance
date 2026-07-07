"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import type { Branch, ChitGroup, ChitGroupStatus } from "@/types";

export interface ChitGroupFormValues {
  groupName: string;
  branchId: string;
  chitValue: number;
  durationMonths: number;
  currentMembers: number;
  startDate: string;
  status: ChitGroupStatus;
  planImage?: string;
}

const EMPTY = (defaultBranchId: string): ChitGroupFormValues => ({
  groupName: "",
  branchId: defaultBranchId,
  chitValue: 100000,
  durationMonths: 20,
  currentMembers: 0,
  startDate: "",
  status: "pending",
  planImage: "",
});

interface ChitGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ChitGroup;
  branches: Branch[];
  lockBranchId?: string;
  onSubmit: (values: ChitGroupFormValues) => void;
}

export function ChitGroupFormDialog({ 
  open, 
  onOpenChange, 
  group, 
  branches, 
  lockBranchId, 
  onSubmit 
}: ChitGroupFormDialogProps) {
  const [values, setValues] = React.useState<ChitGroupFormValues>(EMPTY(lockBranchId ?? branches[0]?.id ?? ""));
  const [wasOpen, setWasOpen] = React.useState(open);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(
        group
          ? {
              groupName: group.groupName,
              branchId: group.branchId,
              chitValue: group.chitValue,
              durationMonths: group.durationMonths,
              currentMembers: group.currentMembers,
              startDate: group.startDate,
              status: group.status,
              planImage: group.planImage || "",
            }
          : EMPTY(lockBranchId ?? branches[0]?.id ?? "")
      );
      setImagePreview(group?.planImage || null);
    }
  }

  function set<K extends keyof ChitGroupFormValues>(key: K, value: ChitGroupFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  // Handle image upload
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValues((v) => ({ ...v, planImage: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove image
  function removeImage() {
    setValues((v) => ({ ...v, planImage: "" }));
    setImagePreview(null);
    const fileInput = document.getElementById('planImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Chit Group" : "Create Chit Group"}</DialogTitle>
          <DialogDescription>
            {group ? "Update this chit group's terms." : "Set up a new chit group for a branch."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="groupName">Chit Name</Label>
              <Input 
                id="groupName" 
                required 
                value={values.groupName} 
                onChange={(e) => set("groupName", e.target.value)} 
                placeholder="Enter chit group name"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="branch">Branch</Label>
              <Select value={values.branchId} onValueChange={(v) => set("branchId", v)} disabled={!!lockBranchId}>
                <SelectTrigger id="branch" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="chitValue">Chit Value (₹)</Label>
              <Input 
                id="chitValue" 
                type="number" 
                min={1} 
                required 
                value={values.chitValue} 
                onChange={(e) => set("chitValue", Number(e.target.value))} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="durationMonths">Duration (months)</Label>
              <Input
                id="durationMonths"
                type="number"
                min={1}
                required
                value={values.durationMonths}
                onChange={(e) => set("durationMonths", Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="currentMembers">Number of Members</Label>
              <Input
                id="currentMembers"
                type="number"
                min={0}
                required
                value={values.currentMembers}
                onChange={(e) => set("currentMembers", Number(e.target.value))}
                placeholder="Enter current member count"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                required 
                value={values.startDate} 
                onChange={(e) => set("startDate", e.target.value)} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as ChitGroupStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan Picture Upload - Full width */}
            <div className="col-span-2 space-y-1.5">
              <Label>Plan Picture</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 hover:border-maroon transition-colors">
                {imagePreview ? (
                  <div className="relative w-full">
                    <div className="relative w-full max-h-[200px] overflow-hidden rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="Plan preview"
                        width={400}
                        height={200}
                        className="object-contain w-full h-auto"
                        unoptimized={imagePreview.startsWith('data:')}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload plan picture
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
                <Input
                  id="planImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {!imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('planImage')?.click()}
                  >
                    Choose File
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark">
              {group ? "Save Changes" : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




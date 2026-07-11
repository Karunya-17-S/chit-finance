"use client";

import * as React from "react";
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
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The exact name the user must type to confirm (e.g. the branch name). */
    confirmText: string;
    title: string;
    description: string;
    onConfirm: () => void;
}

function generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Two-step destructive-delete confirmation:
 *  1. Type the exact name of the item (GitHub/Vercel-style).
 *  2. Type a random 6-digit code shown on screen.
 * No SMS/email service needed — both steps happen on-device, but require two
 * separate deliberate actions, protecting against misclicks or an unattended screen.
 */
export function ConfirmDeleteDialog({ open, onOpenChange, confirmText, title, description, onConfirm }: ConfirmDeleteDialogProps) {
    const [step, setStep] = React.useState<1 | 2>(1);
    const [typedName, setTypedName] = React.useState("");
    const [typedCode, setTypedCode] = React.useState("");
    const [code, setCode] = React.useState("");

    React.useEffect(() => {
        if (open) {
            setStep(1);
            setTypedName("");
            setTypedCode("");
            setCode(generateCode());
        }
    }, [open]);

    const nameMatches = typedName.trim() === confirmText.trim();
    const codeMatches = typedCode.trim() === code;

    function handleContinue() {
        if (!nameMatches) return;
        setStep(2);
    }

    function handleConfirm() {
        if (!codeMatches) return;
        onConfirm();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        {step === 1 ? <AlertTriangle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                        {title}
                    </DialogTitle>
                    <DialogDescription>{step === 1 ? description : "Final check — this cannot be undone by accident."}</DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-2">
                        <Label htmlFor="confirm-delete-name">
                            Type <span className="font-semibold text-foreground">{confirmText}</span> to confirm
                        </Label>
                        <Input
                            id="confirm-delete-name"
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder={confirmText}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="confirm-delete-code">
                            Type this code to finish deleting: <span className="font-mono text-lg font-bold tracking-widest text-foreground">{code}</span>
                        </Label>
                        <Input
                            id="confirm-delete-code"
                            value={typedCode}
                            onChange={(e) => setTypedCode(e.target.value)}
                            placeholder="6-digit code"
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {step === 1 ? (
                        <Button variant="destructive" disabled={!nameMatches} onClick={handleContinue}>
                            Continue
                        </Button>
                    ) : (
                        <Button variant="destructive" disabled={!codeMatches} onClick={handleConfirm}>
                            Delete Permanently
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
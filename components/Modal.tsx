"use client";
import { Fragment } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Transition,
} from "@headlessui/react";

export default function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150"
                />

                {/* Centered panel container */}
                <div className="fixed inset-0 flex items-center justify-center px-4 py-8 overflow-y-auto">
                    <DialogPanel
                        transition
                        className="w-full max-w-2xl rounded-2xl bg-black/70 shadow-glow p-6 text-left align-middle transition-all data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                        {children}
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    );
}
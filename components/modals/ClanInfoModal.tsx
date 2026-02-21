"use client";

import { FaTimes } from "react-icons/fa";
import { useEffect, useRef } from "react";
import { ClanData } from "@/types/clan.types";
import ClanHeader from "@/components/clan/ClanHeader";
import ClanMembersList from "@/components/clan/ClanMembersList";
import ClanDetailsCard from "@/components/clan/ClanDetailsCard";

interface ClanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanName: string;
  memberCount: number;
  clanData: ClanData;
  variant?: "modal" | "inline";
  onSearchMember?: (memberName: string) => void;
  onSearchClan?: (clanName: string) => void;
}

export default function ClanInfoModal({
  isOpen,
  onClose,
  clanName,
  memberCount,
  clanData,
  variant = "modal",
  onSearchMember,
  onSearchClan,
}: ClanInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isInline = variant === "inline";

  useEffect(() => {
    if (isInline || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.focus();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isInline]);

  if (!isOpen && !isInline) return null;

  const content = (
    <div
      ref={modalRef}
      role={isInline ? undefined : "dialog"}
      aria-modal={isInline ? undefined : true}
      aria-label={isInline ? undefined : `Clan: ${clanName}`}
      tabIndex={isInline ? undefined : -1}
      className={`relative bg-[#031111]/95 p-6 md:p-8 rounded-2xl border-2 border-white/10 w-full custom-scrollbar ${
        isInline ? "" : "max-w-5xl max-h-[90vh] overflow-y-auto"
      } shadow-2xl backdrop-blur-xl animate-fade-in outline-none`}
    >
      {!isInline && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
          aria-label="Close"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      )}

      <ClanHeader
        clanName={clanName}
        memberCount={memberCount}
        clanData={clanData}
        onSearchClan={onSearchClan}
        onClose={!isInline ? onClose : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClanMembersList
          clanData={clanData}
          clanName={clanName}
          onSearchMember={onSearchMember}
          onClose={!isInline ? onClose : undefined}
        />
        <ClanDetailsCard clanData={clanData} />
      </div>
    </div>
  );

  if (isInline) {
    return <div className="space-y-8 animate-fade-in">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}

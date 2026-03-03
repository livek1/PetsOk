'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import style from '@/style/pages/cabinet/CabinetPetForm.module.scss';
import {
    updatePet,
    getPetById,
    fetchBreeds,
    addBreed,
    deletePetPhoto,
    setPetAvatar,
    PetFile,
    Breed
} from '@/services/api';

// --- ИКОНКИ ---
interface IconProps { className?: string; }
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>;
const UploadIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const StarIcon = ({ filled }: { filled?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const InfoIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3598FE" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const ChevronDown = ({ className }: IconProps) => <svg className={className} width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#718096" strokeWidth="2"><path d="M1 1.5L6 6.5L11 1.5" /></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

// Более аккуратные иконки питомцев
const DogIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="dog_p0" x1="6.00184" y1="3.72106" x2="7.92676" y2="11.2233" gradientUnits="userSpaceOnUse">
                <stop stopColor="#512D00" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p1" x1="17.9982" y1="3.72106" x2="16.0733" y2="11.2233" gradientUnits="userSpaceOnUse">
                <stop stopColor="#512D00" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p2" x1="12.0002" y1="22.5571" x2="12.0002" y2="1.43587" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="0.0925465" stopColor="#FBBA7E" />
                <stop offset="0.1895" stopColor="#FCC18B" /><stop offset="0.2884" stopColor="#FCCCA0" />
                <stop offset="0.3888" stopColor="#FDDCBD" /><stop offset="0.4893" stopColor="#FEF0E2" />
                <stop offset="0.5546" stopColor="white" /><stop offset="0.6639" stopColor="#FEF0E1" />
                <stop offset="0.802" stopColor="#FDDFC2" /><stop offset="0.9189" stopColor="#FCD6AF" />
                <stop offset="1" stopColor="#FCD2A8" />
            </linearGradient>
            <linearGradient id="dog_p3" x1="15.9315" y1="18.1164" x2="15.9315" y2="-1.58439" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="0.0948012" stopColor="#FCC695" />
                <stop offset="0.2764" stopColor="#FDDFC2" /><stop offset="0.4381" stopColor="#FEF0E3" />
                <stop offset="0.5722" stopColor="#FFFBF8" /><stop offset="0.6624" stopColor="white" />
                <stop offset="0.7499" stopColor="#FFFDFC" /><stop offset="0.8183" stopColor="#FFF8F2" />
                <stop offset="0.8803" stopColor="#FEF0E1" /><stop offset="0.9383" stopColor="#FDE4CA" />
                <stop offset="0.9933" stopColor="#FCD4AC" /><stop offset="1" stopColor="#FCD2A8" />
            </linearGradient>
            <linearGradient id="dog_p4" x1="8.06858" y1="18.1164" x2="8.06858" y2="-1.58439" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="0.0948012" stopColor="#FCC695" />
                <stop offset="0.2764" stopColor="#FDDFC2" /><stop offset="0.4381" stopColor="#FEF0E3" />
                <stop offset="0.5722" stopColor="#FFFBF8" /><stop offset="0.6624" stopColor="white" />
                <stop offset="0.7499" stopColor="#FFFDFC" /><stop offset="0.8183" stopColor="#FFF8F2" />
                <stop offset="0.8803" stopColor="#FEF0E1" /><stop offset="0.9383" stopColor="#FDE4CA" />
                <stop offset="0.9933" stopColor="#FCD4AC" /><stop offset="1" stopColor="#FCD2A8" />
            </linearGradient>
            <linearGradient id="dog_p6" x1="12.0002" y1="16.9714" x2="12.0002" y2="20.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFA25F" /><stop offset="1" stopColor="#FBB87A" />
            </linearGradient>
            <linearGradient id="dog_p7" x1="12.0001" y1="17.3" x2="12.0001" y2="19.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFA25F" /><stop offset="1" stopColor="#FCD2A8" />
            </linearGradient>
            <linearGradient id="dog_p8" x1="12.0002" y1="15.8457" x2="12.0002" y2="20.3486" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A3541E" /><stop offset="1" stopColor="#512D00" />
            </linearGradient>
            <linearGradient id="dog_p9" x1="12.0002" y1="15.8457" x2="12.0002" y2="19.1429" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C46020" /><stop offset="1" stopColor="#7A3A00" />
            </linearGradient>
            <linearGradient id="dog_p10" x1="12.0002" y1="16.3369" x2="12.0002" y2="19.8569" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="0.5" stopColor="white" /><stop offset="1" stopColor="#FCD2A8" />
            </linearGradient>
            <linearGradient id="dog_p11" x1="12.0001" y1="13.8973" x2="12.0001" y2="18.8745" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EFA25F" /><stop offset="1" stopColor="#FBB87A" />
            </linearGradient>
            <linearGradient id="dog_p12" x1="12.0001" y1="15.394" x2="12.0001" y2="18.874" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E89043" /><stop offset="1" stopColor="#FBB87A" />
            </linearGradient>
            <radialGradient id="dog_p13" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(15.8342 10.903) scale(0.8743 1.09138)">
                <stop stopColor="#3C2200" /><stop offset="1" stopColor="#512D00" />
            </radialGradient>
            <radialGradient id="dog_p17" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8.16579 10.903) scale(0.8743 1.09138)">
                <stop stopColor="#3C2200" /><stop offset="1" stopColor="#512D00" />
            </radialGradient>
            <linearGradient id="dog_p18" x1="15.6631" y1="10.1714" x2="15.6631" y2="10.8571" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A3541E" /><stop offset="1" stopColor="#512D00" />
            </linearGradient>
            <linearGradient id="dog_p19" x1="7.99436" y1="10.1714" x2="7.99436" y2="10.8571" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A3541E" /><stop offset="1" stopColor="#512D00" />
            </linearGradient>
            <linearGradient id="dog_p23" x1="11.9978" y1="16.3386" x2="11.3065" y2="13.5267" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3C2200" /><stop offset="1" stopColor="#512D00" />
            </linearGradient>
            <linearGradient id="dog_p24" x1="11.293" y1="13.2511" x2="12.0307" y2="15.2797" gradientUnits="userSpaceOnUse">
                <stop stopColor="#643800" /><stop offset="1" stopColor="#512D00" />
            </linearGradient>
            <linearGradient id="dog_p25" x1="4.64741" y1="1.29027" x2="6.37462" y2="11.6782" gradientUnits="userSpaceOnUse">
                <stop stopColor="#643800" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p26" x1="7.57547" y1="4.74026" x2="6.98279" y2="2.82938" gradientUnits="userSpaceOnUse">
                <stop stopColor="#512D00" /><stop offset="1" stopColor="#3C2200" />
            </linearGradient>
            <linearGradient id="dog_p27" x1="7.75808" y1="8.96498" x2="3.00111" y2="4.75026" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E89043" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p28" x1="3.50022" y1="0.385142" x2="5.1498" y2="4.77154" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p29" x1="17.0457" y1="5.99414" x2="17.0457" y2="12.0399" gradientUnits="userSpaceOnUse">
                <stop stopColor="#643800" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p30" x1="16.4249" y1="4.74026" x2="17.0175" y2="2.82938" gradientUnits="userSpaceOnUse">
                <stop stopColor="#512D00" /><stop offset="1" stopColor="#3C2200" />
            </linearGradient>
            <linearGradient id="dog_p31" x1="16.2422" y1="8.96498" x2="20.9991" y2="4.75027" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E89043" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <linearGradient id="dog_p32" x1="20.5001" y1="0.385142" x2="18.8505" y2="4.77154" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBB87A" /><stop offset="1" stopColor="#A3541E" />
            </linearGradient>
            <radialGradient id="dog_p5" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6.5 8) scale(3 4)">
                <stop stopColor="#FBB87A" /><stop offset="1" stopColor="#A3541E" />
            </radialGradient>
        </defs>
        <path d="M5.04004 11.7484C6.3429 11.1084 6.69147 7.1198 6.44575 5.61123C6.20575 4.12552 8.20576 3.09694 9.24576 4.58837L5.04004 11.7484Z" fill="url(#dog_p0)" />
        <path d="M18.96 11.7484C17.6571 11.1084 17.3143 7.11409 17.56 5.61123C17.8 4.12552 15.8 3.09694 14.76 4.58837L18.96 11.7484Z" fill="url(#dog_p1)" />
        <path d="M12.0002 20.3542C23.4574 20.3542 18.9602 11.7542 18.9602 11.7542C18.4631 4.6685 14.8288 4.28564 12.0002 4.28564C9.17164 4.28564 5.53736 4.6685 5.04022 11.7485C5.04022 11.7485 0.543075 20.3542 12.0002 20.3542Z" fill="url(#dog_p2)" />
        <path d="M18.9601 11.7485C18.9601 11.7485 19.1601 13.2342 19.1944 15.5714C19.2687 20.3485 12.0344 20.3485 12.0344 20.3485C23.4458 20.3371 18.9601 11.7542 18.9601 11.7485Z" fill="url(#dog_p3)" />
        <path d="M5.03991 11.7485C5.03991 11.7485 4.75419 13.2342 4.80562 15.5714C4.90277 20.0342 11.9656 20.3485 11.9656 20.3485C0.554193 20.3371 5.03991 11.7542 5.03991 11.7485Z" fill="url(#dog_p4)" />
        <path d="M14.1544 20.2343C14.5144 19.7543 14.5258 19.2515 14.5544 19.2515C15.6915 19.2515 16.2858 17.8343 16.2858 16.3772C16.2858 15.16 14.4686 13.8686 12.0001 14.3372C9.5315 13.8686 7.71436 15.16 7.71436 16.3772C7.71436 17.8343 8.30864 19.2515 9.44578 19.2515C9.47436 19.2515 9.48578 19.7543 9.84579 20.2343C10.4915 20.3086 11.2058 20.3543 12.0001 20.3543C12.7944 20.3543 13.5086 20.3143 14.1544 20.2343Z" fill="#EFA25F" />
        <path d="M5.04017 11.7483C5.04017 11.7483 3.59446 14.514 4.42874 16.9141C3.89732 14.9426 5.63446 14.1655 9.1316 13.3769C12.7487 12.5655 12.063 7.94833 8.26303 4.97119C6.6516 5.81691 5.32589 7.67405 5.04017 11.7483Z" fill="url(#dog_p5)" />
        <path d="M14.2916 17.6575L12.0002 16.2632L9.70873 17.6575C9.17731 19.1832 10.2516 20.5718 12.0002 20.5718C13.7487 20.5718 14.823 19.1832 14.2916 17.6575Z" fill="url(#dog_p6)" />
        <path d="M9.76012 18.1318C9.70298 18.1318 9.65155 18.126 9.60012 18.1203C9.54869 18.4689 9.58298 18.806 9.69155 19.1089C9.71441 19.1089 9.73726 19.1146 9.76012 19.1146C10.5601 19.1146 11.223 18.6746 11.6173 18.0232C11.8116 17.6975 12.1887 17.6975 12.383 18.0232C12.7773 18.6746 13.4458 19.1146 14.2401 19.1146C14.263 19.1146 14.2858 19.1146 14.3087 19.1089C14.4173 18.806 14.4458 18.4689 14.4001 18.1203C14.3487 18.126 14.2915 18.1318 14.2401 18.1318C12.943 18.1318 12.0001 17.3318 12.0001 16.2632C12.0001 17.3375 11.0516 18.1318 9.76012 18.1318Z" fill="url(#dog_p7)" />
        <path d="M13.3659 18.9828C13.3659 19.7371 12.7545 20.3486 12.0002 20.3486C11.2459 20.3486 10.6345 19.7371 10.6345 18.9828C10.6345 16.7428 11.2459 15.8457 12.0002 15.8457C12.7545 15.8457 13.3659 16.7486 13.3659 18.9828Z" fill="url(#dog_p8)" />
        <path d="M13.3659 18.9829C13.3659 16.7486 12.7545 15.8457 12.0002 15.8457C11.2459 15.8457 10.6345 16.7428 10.6345 18.9829C10.6345 19.04 10.6402 19.0914 10.6459 19.1429C10.9145 19.04 11.1545 18.9086 11.3488 18.7543C11.7374 18.4571 12.2688 18.4571 12.6517 18.7543C12.8517 18.9086 13.0859 19.04 13.3545 19.1429C13.3602 19.0914 13.3659 19.0343 13.3659 18.9829Z" fill="url(#dog_p9)" />
        <path d="M11.7888 17.4055C11.7888 16.8169 11.886 16.3369 12.0002 16.3369C12.1145 16.3369 12.2117 16.8169 12.2117 17.4055C12.2117 19.1541 12.1145 19.8569 12.0002 19.8569C11.886 19.8512 11.7888 19.1483 11.7888 17.4055Z" fill="url(#dog_p10)" />
        <path d="M12.0001 14.3316C9.5315 13.8973 7.71436 15.0916 7.71436 16.2173C7.71436 17.5659 8.30864 18.8745 9.44579 18.8745C10.9201 18.8745 12.0058 18.0745 12.0058 17.0059C12.0058 18.0745 13.0858 18.8745 14.5658 18.8745C15.7029 18.8745 16.2972 17.5659 16.2972 16.2173C16.2858 15.0916 14.4686 13.8973 12.0001 14.3316Z" fill="url(#dog_p11)" />
        <path d="M9.44007 18.874C10.7829 18.874 11.7944 18.2169 11.9715 17.2969C11.9829 17.2912 12.0401 17.2798 12.0286 17.2969C12.2058 18.2169 13.2172 18.874 14.5601 18.874C15.6972 18.874 16.2915 17.5655 16.2915 16.2169C16.2915 15.9598 16.2001 15.6855 16.0229 15.4112C16.0744 16.8683 15.5258 18.3998 14.6572 18.4283C13.4172 18.4683 12.4858 17.6683 12.9486 17.2398C13.4058 16.8112 14.2344 16.0855 13.7944 15.394C13.7944 15.394 13.2515 15.954 12.7601 16.474C12.7429 15.6969 10.2058 15.394 10.2058 15.394C9.76579 16.0855 10.5944 16.8112 11.0515 17.2398C11.5086 17.6683 10.5829 18.474 9.34293 18.4283C8.48007 18.3998 7.9315 16.874 7.97721 15.4226C7.80578 15.6912 7.71436 15.9598 7.71436 16.2169C7.71436 17.5655 8.30864 18.874 9.44007 18.874Z" fill="url(#dog_p12)" />
        <path d="M15.8342 11.9944C16.3171 11.9944 16.7085 11.5057 16.7085 10.903C16.7085 10.3002 16.3171 9.81152 15.8342 9.81152C15.3514 9.81152 14.96 10.3002 14.96 10.903C14.96 11.5057 15.3514 11.9944 15.8342 11.9944Z" fill="url(#dog_p13)" />
        <path d="M8.16579 11.9944C8.64864 11.9944 9.04007 11.5057 9.04007 10.903C9.04007 10.3002 8.64864 9.81152 8.16579 9.81152C7.68293 9.81152 7.2915 10.3002 7.2915 10.903C7.2915 11.5057 7.68293 11.9944 8.16579 11.9944Z" fill="url(#dog_p17)" />
        <path d="M15.6631 10.8571C15.8177 10.8571 15.9431 10.7036 15.9431 10.5142C15.9431 10.3249 15.8177 10.1714 15.6631 10.1714C15.5084 10.1714 15.3831 10.3249 15.3831 10.5142C15.3831 10.7036 15.5084 10.8571 15.6631 10.8571Z" fill="url(#dog_p18)" />
        <path d="M7.99436 10.8571C8.149 10.8571 8.27436 10.7036 8.27436 10.5142C8.27436 10.3249 8.149 10.1714 7.99436 10.1714C7.83972 10.1714 7.71436 10.3249 7.71436 10.5142C7.71436 10.7036 7.83972 10.8571 7.99436 10.8571Z" fill="url(#dog_p19)" />
        <path d="M13.7373 15.0917C13.4001 14.5889 12.6973 14.3317 12.0001 14.3203C11.303 14.3317 10.6001 14.5889 10.263 15.0917C8.83441 17.2117 10.8173 17.4632 11.703 17.4517C11.903 17.446 12.103 17.446 12.303 17.4517C13.183 17.4689 15.1658 17.2117 13.7373 15.0917Z" fill="url(#dog_p23)" />
        <path d="M10.7486 15.2685C11.2343 15.6057 12.7657 15.6057 13.2572 15.2685C13.5143 15.0914 12.6057 14.6914 12.0057 14.6914C11.3943 14.6914 10.4914 15.0914 10.7486 15.2685Z" fill="url(#dog_p24)" />
        <path d="M6.9545 5.99414C5.97165 7.07985 5.24593 8.857 5.04022 11.7484C5.04022 11.7484 4.98879 11.8513 4.90308 12.0341C6.94879 13.1999 7.25165 7.38271 6.9545 5.99414Z" fill="url(#dog_p25)" />
        <path d="M6.33737 6.82834C6.48594 6.58262 6.64594 6.35976 6.81165 6.15977C6.7488 5.80548 6.75451 5.47977 6.85165 5.25691C7.27451 4.31977 8.5088 3.78834 8.40594 4.90262C8.73165 4.74834 9.06308 4.62834 9.40023 4.54262C8.31451 2.90262 5.93737 4.33119 6.17165 5.78262C6.20594 5.99977 6.3088 6.46834 6.33737 6.82834Z" fill="url(#dog_p26)" />
        <path d="M9.24582 4.58856C9.3544 4.55999 9.46297 4.53142 9.57154 4.50285C9.57154 4.50285 8.12011 1.96571 3.73725 4.69713C0.805822 6.52571 2.86868 12.8228 5.04011 11.7543C6.34297 11.1086 6.50868 7.22285 6.44582 5.61142C6.38297 4.10856 8.20582 3.09713 9.24582 4.58856Z" fill="url(#dog_p27)" />
        <path opacity="0.5" d="M9.24601 4.58865C9.32601 4.56579 9.4003 4.54865 9.4803 4.52579C8.93173 3.83436 8.36601 3.55436 7.44601 3.73151C6.66315 3.88579 6.11458 4.89151 6.14887 5.77151C6.18315 6.60579 6.14887 7.90865 5.96601 9.07436C5.74887 10.4001 5.37744 11.2572 4.91458 11.4858C4.12601 11.8744 3.26887 10.9601 2.77172 10.0629C2.70887 9.94865 2.64601 9.82865 2.58887 9.70294C3.06887 11.1772 4.0403 12.2458 5.0403 11.7544C6.34315 11.1086 6.50887 7.22294 6.44601 5.61151C6.38315 4.10865 8.20601 3.09722 9.24601 4.58865Z" fill="url(#dog_p28)" />
        <path d="M17.0457 5.99414C18.0286 7.07985 18.7543 8.857 18.96 11.7541C18.96 11.7541 19.0115 11.857 19.0972 12.0399C17.0515 13.1999 16.7486 7.38271 17.0457 5.99414Z" fill="url(#dog_p29)" />
        <path d="M17.663 6.82834C17.5144 6.58262 17.3544 6.35976 17.1887 6.15977C17.2515 5.80548 17.2458 5.47977 17.1487 5.25691C16.7258 4.31977 15.4915 3.78834 15.5944 4.90262C15.2687 4.74834 14.9372 4.62834 14.6001 4.54262C15.6858 2.90262 18.063 4.33119 17.8287 5.78262C17.7944 5.99977 17.6915 6.46834 17.663 6.82834Z" fill="url(#dog_p30)" />
        <path d="M14.7544 4.58856C14.6459 4.55999 14.5373 4.53142 14.4287 4.50285C14.4287 4.50285 15.8801 1.96571 20.263 4.69713C23.1944 6.52571 21.1316 12.8228 18.9601 11.7543C17.6573 11.1143 17.4916 7.22285 17.5601 5.61713C17.6173 4.10856 15.7944 3.09713 14.7544 4.58856Z" fill="url(#dog_p31)" />
        <path opacity="0.5" d="M14.7543 4.58865C14.6743 4.56579 14.6 4.54865 14.52 4.52579C15.0686 3.83436 15.6343 3.55436 16.5543 3.73151C17.3372 3.88579 17.8857 4.89151 17.8514 5.77151C17.8172 6.60579 17.8514 7.90865 18.0343 9.07436C18.2515 10.4001 18.6229 11.2572 19.0857 11.4858C19.8743 11.8744 20.7315 10.9601 21.2286 10.0629C21.2915 9.94865 21.3543 9.82865 21.4115 9.70294C20.9315 11.1772 19.96 12.2458 18.96 11.7544C17.6572 11.1144 17.4914 7.22294 17.56 5.61722C17.6172 4.10865 15.7943 3.09722 14.7543 4.58865Z" fill="url(#dog_p32)" />
        {/* блики глаз */}
        <path d="M14.84 16.9833C14.9315 16.9833 15.0057 16.9091 15.0057 16.8176C15.0057 16.726 14.9315 16.6519 14.84 16.6519C14.7485 16.6519 14.6743 16.726 14.6743 16.8176C14.6743 16.9091 14.7485 16.9833 14.84 16.9833Z" fill="white" />
        <path d="M15.2687 17.7089C15.3603 17.7089 15.4345 17.6347 15.4345 17.5432C15.4345 17.4516 15.3603 17.3774 15.2687 17.3774C15.1772 17.3774 15.103 17.4516 15.103 17.5432C15.103 17.6347 15.1772 17.7089 15.2687 17.7089Z" fill="white" />
        <path d="M15.6572 16.6058C15.7487 16.6058 15.8229 16.5316 15.8229 16.4401C15.8229 16.3486 15.7487 16.2744 15.6572 16.2744C15.5656 16.2744 15.4915 16.3486 15.4915 16.4401C15.4915 16.5316 15.5656 16.6058 15.6572 16.6058Z" fill="white" />
        <path d="M9.1601 17.0399C9.25162 17.0399 9.32581 16.9657 9.32581 16.8742C9.32581 16.7827 9.25162 16.7085 9.1601 16.7085C9.06858 16.7085 8.99438 16.7827 8.99438 16.8742C8.99438 16.9657 9.06858 17.0399 9.1601 17.0399Z" fill="white" />
        <path d="M8.73163 17.7601C8.82315 17.7601 8.89734 17.6859 8.89734 17.5944C8.89734 17.5029 8.82315 17.4287 8.73163 17.4287C8.64011 17.4287 8.56592 17.5029 8.56592 17.5944C8.56592 17.6859 8.64011 17.7601 8.73163 17.7601Z" fill="white" />
        <path d="M8.34296 16.6571C8.43448 16.6571 8.50867 16.5829 8.50867 16.4914C8.50867 16.3999 8.43448 16.3257 8.34296 16.3257C8.25144 16.3257 8.17725 16.3999 8.17725 16.4914C8.17725 16.5829 8.25144 16.6571 8.34296 16.6571Z" fill="white" />
    </svg>
);
const CatIcon = () => (
    <svg width="28" height="28" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* тело головы */}
        <path d="M114.67 70.19C112.71 44.22 94.44 26.3 64 26.3S15.25 45.33 13.45 71.31c-1.05 15.14 4.58 28.63 15.91 36.32c7.46 5.07 17.88 7.88 34.77 7.88c17.18 0 27.03-3.71 34.49-8.73c12.43-8.35 17.18-21.67 16.05-36.59z" fill="#ffc022" />

        {/* левое ухо */}
        <path d="M53.72 42.6C46.3 23.4 30.1 10.34 23.87 8.39c-2.35-.74-5.3-.81-6.63 1.35c-3.36 5.45-7.66 22.95 1.85 47.78L53.72 42.6z" fill="#ffc022" />
        {/* внутри левого уха */}
        <path d="M36.12 34.21c1.54-1.29 2.29-2.55.6-5.16c-2.62-4.05-7.33-8.78-9.16-10.23c-3-2.38-5.32-3.18-6.21.65c-1.65 7.08-1.52 16.69.25 21.99c.62 1.87 2.54 2.86 4.02 1.57l10.5-8.82z" fill="#ffd1d1" />

        {/* левая внутренняя тень уха */}
        <path d="M54.12 45.02c1.13.96 3.42.82 4.75-.72c1.61-1.87 3.29-8.17 2.24-17.91c-4.67.17-9.09.84-13.21 1.97c3.33 5.46 4.13 14.88 6.22 16.66z" fill="#ff9b31" />
        {/* правая внутренняя тень уха */}
        <path d="M73.88 45.02c-1.13.96-3.42.82-4.75-.72c-1.61-1.87-3.29-8.17-2.24-17.91c4.67.17 9.09.84 13.21 1.97c-3.33 5.46-4.13 14.88-6.22 16.66z" fill="#ff9b31" />

        {/* правое ухо */}
        <path d="M79.9 29.22c8.08-12.41 19.38-20.75 24.07-22.24c2.32-.74 5.02-.62 6.34 1.55c3.32 5.45 6.13 22.24-.42 45.75L85.96 42.74L79.9 29.22z" fill="#ffc022" />
        {/* внутри правого уха */}
        <path d="M97.55 38.23c2.43 2.43 4.41 4.06 5.84 5.61c.95 1.03 2.69.56 2.97-.82c2.45-11.8 1.67-21.86 0-24.5c-.8-1.26-2.29-1.59-3.65-1.13c-2.44.81-8.66 5.45-13.05 12.22c-.51.79-.32 1.85.46 2.38c1.58 1.07 4.34 3.14 7.43 6.24z" fill="#ffd1d1" />

        {/* нос */}
        <path d="M55.67 77.75c-.05-3.08 4.37-4.55 8.54-4.62c4.18-.07 8.68 1.29 8.73 4.37c.05 3.08-5.22 7.13-8.54 7.13c-3.31 0-8.67-3.81-8.73-6.88z" fill="#000000" />

        {/* усы левые */}
        <path d="M6.7 71.03c.34.41 4.41.35 14.36 5.07" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />
        <path d="M2.9 82.86s6.42-2.24 17.46-.28" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />
        <path d="M8.81 92.29s2.74-1.38 12.67-2.25" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />

        {/* усы правые */}
        <path d="M120.87 67.51s-3.41.33-13.94 6.34" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />
        <path d="M122.42 78.49s-5.09-.36-16.05 1.97" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />
        <path d="M120.45 89.05s-4.83-1.71-14.78-2.25" stroke="#9e9e9e" strokeWidth="3" strokeLinecap="round" />

        {/* правый глаз */}
        <path d="M96.09 66.37c-.34 5.51-3.76 8.54-7.65 8.54s-7.04-3.88-7.04-8.66s3.28-8.71 7.65-8.47c5.07.29 7.32 4.09 7.04 8.59z" fill="#000200" />

        {/* левый глаз */}
        <path d="M46 65.81c.78 5.61-1.58 9.03-5.49 9.82c-3.91.79-7.26-1.84-8.23-6.64c-.98-4.81.9-9.32 5.34-9.97c5.15-.75 7.74 2.2 8.38 6.79z" fill="#000200" />

        {/* рот */}
        <path d="M44.99 85.16c-2.57 1.67.47 5.54 2.25 6.85c1.78 1.31 4.98 2.92 9.67 2.44c5.54-.56 7.13-4.69 7.13-4.69s1.97 4.6 8.82 4.79c6.95.19 9.1-3.57 10.04-4.69c.94-1.13 1.88-4.04.28-5.16c-1.6-1.13-2.72.28-4.41 2.63c-1.69 2.35-5.16 3.66-8.54 2.06s-3.57-7.04-3.57-7.04l-4.79.28s-.75 4.69-2.91 6.19s-7.32 1.88-9.48-1.41c-.95-1.46-2.33-3.66-4.49-2.25z" fill="#000000" />

    </svg>
);

const CabinetPetForm: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const id = params.id as string;
    const returnToOrderUuid = searchParams.get('returnToOrderUuid');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Медиа
    const [existingFiles, setExistingFiles] = useState<PetFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [avatarId, setAvatarId] = useState<number | null>(null);

    // Породы
    const [breedQuery, setBreedQuery] = useState('');
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [showBreeds, setShowBreeds] = useState(false);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [addingBreed, setAddingBreed] = useState(false);
    const breedInputRef = useRef<HTMLInputElement>(null);

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            type_id: '1',
            name: '',
            breed_id: '',
            gender: '0',
            size_id: '3',
            year: '',
            month: '',
            sterilized: '0',
            vaccinated: '0',
            staying_home_alone: '0',
            kids_friendly: '0',
            dogs_friendly: '0',
            cats_friendly: '0',
            info_for_sitting: '',
            info_for_walking: ''
        }
    });

    const typeId = watch('type_id');
    const currentBreedId = watch('breed_id');

    // --- 1. ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => {
        if (id) {
            getPetById(id).then(response => {
                const pet = response.data || response;

                const safeTypeId = pet.type?.data?.id || pet.type_id || 1;
                const safeBreedId = pet.breed?.data?.id || pet.breed_id || '';
                const safeSizeId = pet.size?.data?.id || pet.size_id || 3;

                const isMale =
                    (pet.gender_value && String(pet.gender_value).toLowerCase() === 'male') ||
                    pet.gender === 0 ||
                    pet.gender === '0';

                const safeGender = isMale ? '0' : '1';

                setValue('name', pet.name);
                setValue('type_id', String(safeTypeId));
                setValue('breed_id', String(safeBreedId));
                setBreedQuery(pet.breed?.data?.name || pet.breed?.name || '');

                setValue('gender', safeGender);
                setValue('year', String(pet.year || ''));
                setValue('month', String(pet.month || ''));
                setValue('size_id', String(safeSizeId));

                const mapBool = (val: any) => val !== undefined && val !== null ? String(val) : '0';

                setValue('sterilized', mapBool(pet.sterilized_value ?? pet.sterilized));
                setValue('vaccinated', mapBool(pet.vaccinated_value ?? pet.vaccinated));
                setValue('staying_home_alone', mapBool(pet.staying_home_alone_value ?? pet.staying_home_alone));
                setValue('kids_friendly', mapBool(pet.kids_friendly_value ?? pet.kids_friendly));
                setValue('dogs_friendly', mapBool(pet.dogs_friendly_value ?? pet.dogs_friendly));
                setValue('cats_friendly', mapBool(pet.cats_friendly_value ?? pet.cats_friendly));

                setValue('info_for_sitting', pet.info_for_sitting || '');
                setValue('info_for_walking', pet.info_for_walking || '');

                const files = pet.files?.data || pet.media?.data || [];
                setExistingFiles(files);
                const currentAvatarId = pet.avatar?.data?.id || pet.avatar_id;
                if (currentAvatarId) setAvatarId(currentAvatarId);

                setLoading(false);
            }).catch((err) => {
                console.error(err);
                alert('Ошибка загрузки данных');
                router.push('/cabinet/pets');
            });
        }
    }, [id, setValue, router]);

    // --- 2. ПОИСК ПОРОД ---
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (breedQuery.length > 1 && showBreeds) {
                setLoadingBreeds(true);
                try {
                    const res = await fetchBreeds(breedQuery, parseInt(typeId));
                    const data = Array.isArray(res) ? res : (res.data || []);
                    setBreeds(data);
                } catch (e) { console.error(e); }
                finally { setLoadingBreeds(false); }
            } else {
                setBreeds([]);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [breedQuery, typeId, showBreeds]);

    // --- 3. ОБРАБОТЧИКИ ФАЙЛОВ ---
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (existingFiles.length + newFiles.length + e.target.files.length > 10) {
                alert(t('petForm.maxPhotosReached', 'Максимум 10 фото'));
                return;
            }
            setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewFile = (index: number) => setNewFiles(prev => prev.filter((_, i) => i !== index));

    const removeExistingFile = async (fileId: number) => {
        if (window.confirm('Удалить фото?')) {
            try {
                await deletePetPhoto(fileId);
                setExistingFiles(prev => prev.filter(f => f.id !== fileId));
                if (avatarId === fileId) setAvatarId(null);
            } catch (e) { alert('Ошибка удаления'); }
        }
    };

    const handleSetAvatar = async (fileId: number) => {
        if (id) {
            try {
                await setPetAvatar(id, fileId);
                setAvatarId(fileId);
            } catch (e) { alert('Ошибка установки аватара'); }
        }
    };

    // --- 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    const handleBreedSelect = (breed: Breed) => {
        setValue('breed_id', String(breed.id));
        setBreedQuery(breed.name);
        setShowBreeds(false);
    };

    const handleAddCustomBreed = async () => {
        if (!breedQuery || addingBreed) return;
        setAddingBreed(true);
        try {
            const res = await addBreed({ query: breedQuery, typeId: parseInt(typeId) });
            // Обрабатываем формат ответа API
            const newBreed = res?.data?.data || res?.data;

            if (newBreed && newBreed.id) {
                setValue('breed_id', String(newBreed.id));
                setBreedQuery(newBreed.name);
                setShowBreeds(false);
            } else {
                alert('Не удалось получить ID новой породы');
            }
        } catch (e) {
            console.error(e);
            alert('Не удалось добавить породу');
        } finally {
            setAddingBreed(false);
        }
    };

    const handleTypeChange = (val: string) => {
        setValue('type_id', val);
        setValue('breed_id', '');
        setBreedQuery('');
        setBreeds([]);
    };

    const handleBackClick = () => {
        if (returnToOrderUuid) {
            router.push(`/cabinet/orders/create?uuid=${returnToOrderUuid}`);
        } else {
            router.push('/cabinet/pets');
        }
    };

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            const payload = { ...data, breed_id: data.breed_id || null };
            await updatePet(id, payload, newFiles);

            if (returnToOrderUuid) {
                router.push(`/cabinet/orders/create?uuid=${returnToOrderUuid}`);
            } else {
                router.push('/cabinet/pets');
            }
        } catch (e: any) {
            console.error(e);
            alert('Ошибка сохранения. Проверьте обязательные поля.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={style.loadingState}>{t('loading')}</div>;

    return (
        <div className={style.formContainer}>
            <button className={style.backButton} onClick={handleBackClick}>
                <BackIcon /> {returnToOrderUuid ? 'Вернуться к созданию заказа' : t('common.backToProfile', 'Вернуться к питомцам')}
            </button>

            <div className={style.headerBlock}>
                <h1 className={style.pageTitle}>{t('petForm.titleEdit', 'Редактирование')}</h1>
            </div>

            {/* Блок с объяснением важности формы */}
            <div style={{
                display: 'flex', gap: '12px', background: '#F0F7FF', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#1A202C'
            }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}><InfoIcon /></div>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <strong>Почему анкета такая подробная?</strong>
                    <p style={{ marginTop: '4px', margin: 0, color: '#4A5568' }}>
                        Форма может показаться объемной, но, пожалуйста, заполните её максимально честно.
                        Эти данные критически важны для ситтера — они помогут найти правильный подход к вашему любимцу и сделать его пребывание по-настоящему комфортным и безопасным.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

                {/* --- ТИП ПИТОМЦА --- */}
                <div className={style.typeSection}>
                    <div className={style.visualRadioGroup}>
                        <div
                            className={`${style.visualRadio} ${typeId === '1' ? style.active : ''}`}
                            onClick={() => handleTypeChange('1')}
                        >
                            <DogIcon />
                            <span style={{ marginTop: '8px' }}>{t('petTypes.dog', 'Собака')}</span>
                            <input type="hidden" value="1" {...register('type_id')} />
                        </div>
                        <div
                            className={`${style.visualRadio} ${typeId === '2' ? style.active : ''}`}
                            onClick={() => handleTypeChange('2')}
                        >
                            <CatIcon />
                            <span style={{ marginTop: '8px' }}>{t('petTypes.cat', 'Кошка')}</span>
                        </div>
                    </div>
                </div>

                {/* --- 1. ФОТОГРАФИИ --- */}
                <div className={style.card}>
                    <div className={style.cardHeader}>
                        <h2 className={style.sectionTitle}>{t('petForm.sectionPhotos', 'Фотографии')}</h2>
                        <span className={style.sectionHint}>{t('petForm.photoHint', 'Загрузите до 10 фото')}</span>
                    </div>

                    <div className={style.mediaGrid}>
                        {existingFiles.map(file => (
                            <div key={file.id} className={`${style.mediaItem} ${avatarId === file.id ? style.isAvatar : ''}`}>
                                <img src={file.preview_url || file.url} alt="Pet" />
                                <div className={style.mediaActions}>
                                    <button
                                        type="button"
                                        className={`${style.starBtn} ${avatarId === file.id ? style.active : ''}`}
                                        onClick={() => handleSetAvatar(file.id)}
                                        title="Сделать главным фото"
                                    >
                                        <StarIcon filled={avatarId === file.id} />
                                    </button>
                                    <button type="button" className={style.deleteBtn} onClick={() => removeExistingFile(file.id)}>
                                        <TrashIcon />
                                    </button>
                                </div>
                                {avatarId === file.id && <span className={style.avatarLabel}>Главное</span>}
                            </div>
                        ))}

                        {newFiles.map((file, idx) => (
                            <div key={idx} className={style.mediaItem}>
                                <img src={URL.createObjectURL(file)} alt="New upload" />
                                <button type="button" className={style.deleteBtn} onClick={() => removeNewFile(idx)}>
                                    <TrashIcon />
                                </button>
                                <span className={style.newBadge}>Новое</span>
                            </div>
                        ))}

                        {(existingFiles.length + newFiles.length < 10) && (
                            <label className={style.uploadBtn}>
                                <div className={style.uploadContent}>
                                    <UploadIcon />
                                    <span>{t('petForm.addPhoto', 'Загрузить')}</span>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={onFileSelect} />
                            </label>
                        )}
                    </div>
                    {existingFiles.length === 0 && newFiles.length === 0 && (
                        <p className={style.emptyPhotosMsg}>
                            {t('petForm.noPhotos', 'Фотографии повышают доверие ситтеров. Добавьте хотя бы одну!')}
                        </p>
                    )}
                </div>

                {/* --- 2. ДЕТАЛИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionDetails', 'Основная информация')}</h2>

                    <div className={style.grid2}>
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelName', 'Кличка')} <span className={style.required}>*</span></label>
                            <input
                                className={`${style.input} ${errors.name ? style.errorInput : ''}`}
                                {...register('name', { required: true })}
                                placeholder={t('petForm.placeholderName', 'Как зовут питомца?')}
                            />
                            {errors.name && <span className={style.errorText}>Укажите кличку</span>}
                        </div>

                        {/* Порода с автокомплитом и улучшенным UX */}
                        <div className={style.formGroup} style={{ position: 'relative' }}>
                            <label>{t('petForm.labelBreed', 'Порода')} <span className={style.required}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={breedInputRef}
                                    className={`${style.input} ${errors.breed_id ? style.errorInput : ''}`}
                                    style={{ paddingRight: '40px' }}
                                    value={breedQuery}
                                    onChange={e => {
                                        setBreedQuery(e.target.value);
                                        setValue('breed_id', ''); // Сбрасываем id, если текст меняется
                                        setShowBreeds(true);
                                    }}
                                    onFocus={() => setShowBreeds(true)}
                                    onBlur={() => setTimeout(() => setShowBreeds(false), 200)}
                                    placeholder={t('petForm.placeholderBreed', 'Начните вводить...')}
                                    autoComplete="off"
                                />
                                {/* Индикатор успешного выбора породы */}
                                {currentBreedId && breedQuery && (
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                        <CheckIcon />
                                    </div>
                                )}
                            </div>

                            {showBreeds && breedQuery.length > 0 && (
                                <ul className={style.suggestionsList}>
                                    {loadingBreeds ? (
                                        <li className={style.loadingItem}>Ищем...</li>
                                    ) : (
                                        <>
                                            {breeds.map(b => (
                                                <li key={b.id} onMouseDown={(e) => { e.preventDefault(); handleBreedSelect(b); }}>
                                                    {b.name}
                                                </li>
                                            ))}
                                            {!loadingBreeds && (
                                                <li className={style.addItem} onMouseDown={(e) => { e.preventDefault(); handleAddCustomBreed(); }}>
                                                    <PlusIcon />
                                                    <span style={{ marginLeft: '8px' }}>
                                                        {addingBreed ? 'Добавляем...' : `Добавить породу "${breedQuery}"`}
                                                    </span>
                                                </li>
                                            )}
                                        </>
                                    )}
                                </ul>
                            )}
                            <input type="hidden" {...register('breed_id', { required: true })} />
                            {errors.breed_id && (
                                <span className={style.errorText}>
                                    Пожалуйста, выберите породу из выпадающего списка или нажмите "Добавить породу".
                                </span>
                            )}
                            <span className={style.helperText}>{t('petForm.breedHelp', 'Если беспородный, напишите "Метис"')}</span>
                        </div>
                    </div>

                    <div className={style.grid2}>
                        {/* Пол - Сегментированный контроль */}
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelGender', 'Пол')} <span className={style.required}>*</span></label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <div className={style.segmentedControlSimple}>
                                        <button type="button" className={field.value === '0' ? style.active : ''} onClick={() => field.onChange('0')}>
                                            {t('common.male', 'Мальчик')}
                                        </button>
                                        <button type="button" className={field.value === '1' ? style.active : ''} onClick={() => field.onChange('1')}>
                                            {t('common.female', 'Девочка')}
                                        </button>
                                    </div>
                                )}
                            />
                        </div>

                        <div className={style.formGroup}>
                            <label>{t('petForm.labelSize', 'Размер')} <span className={style.required}>*</span></label>
                            <div className={style.selectWrapper}>
                                <select className={style.select} {...register('size_id')}>
                                    <option value="1">Мини (до 5 кг)</option>
                                    <option value="2">Маленький (5-10 кг)</option>
                                    <option value="3">Средний (10-20 кг)</option>
                                    <option value="4">Большой (20-40 кг)</option>
                                    <option value="5">Гигант (40+ кг)</option>
                                </select>
                                <ChevronDown className={style.selectArrow} />
                            </div>
                        </div>
                    </div>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelAge', 'Возраст')}</label>
                        <div className={style.ageInputs}>
                            <div className={style.ageInputWrapper}>
                                <input type="number" className={style.input} {...register('year')} placeholder="0" min="0" max="30" />
                                <span className={style.ageLabel}>{t('common.years_short', 'лет')}</span>
                            </div>
                            <div className={style.ageInputWrapper}>
                                <input type="number" className={style.input} {...register('month')} placeholder="0" min="0" max="11" />
                                <span className={style.ageLabel}>{t('common.months_short', 'мес')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. ХАРАКТЕР (КНОПКИ) --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionBehavior', 'Здоровье и характер')}</h2>
                    <p className={style.sectionSubtitle}>{t('petForm.behaviorSubtitle', 'Честные ответы помогут подобрать идеального ситтера.')}</p>

                    <div className={style.behaviorGrid}>
                        <SegmentedControl label={t('petForm.labelSterilized', 'Стерилизован?')} name="sterilized" control={control} t={t} />
                        <SegmentedControl label={t('petForm.labelVaccinated', 'Вакцинирован?')} name="vaccinated" control={control} t={t} />
                        <SegmentedControl label={t('petForm.labelHomeAlone', 'Остается один дома?')} name="staying_home_alone" control={control} t={t} sub={t('petForm.homeAloneSub', 'Не воет и не портит вещи')} />
                        <SegmentedControl label={t('petForm.labelKidsFriendly', 'Ладит с детьми?')} name="kids_friendly" control={control} t={t} />
                        <SegmentedControl label={t('petForm.labelDogsFriendly', 'Дружелюбен к собакам?')} name="dogs_friendly" control={control} t={t} />
                        <SegmentedControl label={t('petForm.labelCatsFriendly', 'Дружелюбен к кошкам?')} name="cats_friendly" control={control} t={t} />
                    </div>
                </div>

                {/* --- 4. ПОДРОБНОСТИ --- */}
                <div className={style.card}>
                    <h2 className={style.sectionTitle}>{t('petForm.sectionAdditionalInfo', 'Особенности ухода')}</h2>

                    <div className={style.formGroup}>
                        <label>{t('petForm.labelInfoSitting', 'Важно для передержки (дома у ситтера)')} <span className={style.required}>*</span></label>
                        <div className={style.tipsBlock}>
                            <InfoIcon />
                            <span>
                                {typeId === '1'
                                    ? "Опишите: режим кормления, аллергии, где привык спать, можно ли на диван, как терпит туалет?"
                                    : "Опишите: какой лоток используете, режим кормления, дерет ли мебель, любит играть или прятаться?"}
                            </span>
                        </div>
                        <textarea
                            className={style.textarea}
                            {...register('info_for_sitting', { required: true })}
                            placeholder={t('petForm.placeholderInfoSitting', 'Например: Ест сухой корм 2 раза в день. Спит на своей лежанке. Боится громких звуков.')}
                        />
                        {errors.info_for_sitting && <span className={style.errorText}>{t('validation.fieldRequired', 'Пожалуйста, напишите пару слов о привычках')}</span>}
                    </div>

                    {typeId === '1' && (
                        <div className={style.formGroup}>
                            <label>{t('petForm.labelInfoWalking', 'Важно для выгула')} <span className={style.required}>*</span></label>
                            <p className={style.helperText} style={{ marginBottom: 8 }}>
                                Как гуляет? Тянет поводок? Знает команды? Подбирает с земли?
                            </p>
                            <textarea
                                className={style.textarea}
                                {...register('info_for_walking', { required: true })}
                                placeholder={t('petForm.placeholderInfoWalking', 'Например: Гуляем 2 раза по 30 мин. На поводке ходит спокойно. Не любит больших собак.')}
                            />
                            {errors.info_for_walking && <span className={style.errorText}>{t('validation.fieldRequired', 'Опишите нюансы прогулки')}</span>}
                        </div>
                    )}
                </div>

                <div className={style.actions}>
                    <button type="submit" disabled={submitting} className={style.btnPrimary}>
                        {submitting ? t('loading') : t('common.save', 'Сохранить питомца')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const SegmentedControl = ({ label, sub, name, control, t }: any) => (
    <div className={style.segmentRow}>
        <div className={style.segmentLabel}>
            {label}
            {sub && <span className={style.subLabel}>{sub}</span>}
        </div>
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className={style.segmentedControl}>
                    <button type="button" className={field.value === '1' ? style.yes : ''} onClick={() => field.onChange('1')}>{t('common.yes', 'Да')}</button>
                    <button type="button" className={field.value === '2' ? style.no : ''} onClick={() => field.onChange('2')}>{t('common.no', 'Нет')}</button>
                    <button type="button" className={field.value === '0' ? style.unknown : ''} onClick={() => field.onChange('0')}>{t('common.unknown', 'Не знаю')}</button>
                </div>
            )}
        />
    </div>
);

export default CabinetPetForm;
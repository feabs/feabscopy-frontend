"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText } from 'lucide-react';
import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const kycSchema = z.object({
  idDocument: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "ID Document is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ALLOWED_FILE_TYPES.includes(files[0]?.type),
      "Only .jpg, .png, and .pdf files are allowed."
    ),
  proofOfAddress: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "Proof of Address is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ALLOWED_FILE_TYPES.includes(files[0]?.type),
      "Only .jpg, .png, and .pdf files are allowed."
    ),
});

type KycFormValues = z.infer<typeof kycSchema>;

export default function KycForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [addressFileName, setAddressFileName] = useState<string | null>(null);

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycSchema),
  });

  const onSubmit = async (data: KycFormValues) => {
    // Simulate API call for file upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("KYC Data Submitted:", {
      idDocumentName: data.idDocument[0].name,
      proofOfAddressName: data.proofOfAddress[0].name,
    });
    toast({
      title: "KYC Documents Submitted",
      description: "Your documents are under review. You will be notified once approved.",
    });
    // On successful KYC submission:
    router.push('/dashboard?kyc_status=pending'); // Redirect to dashboard, status can be shown there
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'idDocument' | 'proofOfAddress') => {
    const file = event.target.files?.[0];
    if (file) {
      if (fieldName === 'idDocument') setIdFileName(file.name);
      if (fieldName === 'proofOfAddress') setAddressFileName(file.name);
      form.setValue(fieldName, event.target.files as FileList, { shouldValidate: true });
    } else {
      if (fieldName === 'idDocument') setIdFileName(null);
      if (fieldName === 'proofOfAddress') setAddressFileName(null);
      form.setValue(fieldName, new DataTransfer().files, { shouldValidate: true }); // Set to empty FileList
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="idDocument"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload ID Document (e.g., Passport, Driver's License)</FormLabel>
              <FormControl>
                <div className="relative flex items-center justify-center w-full">
                    <label htmlFor="idDocument-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-input bg-background hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or PDF (MAX. 5MB)</p>
                        </div>
                        <Input 
                          id="idDocument-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, 'idDocument')}
                          accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                    </label>
                </div>
              </FormControl>
              {idFileName && <p className="text-sm text-muted-foreground mt-2 flex items-center"><FileText size={16} className="mr-2 shrink-0" />{idFileName}</p>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proofOfAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Proof of Address (e.g., Utility Bill, Bank Statement)</FormLabel>
              <FormControl>
                 <div className="relative flex items-center justify-center w-full">
                    <label htmlFor="proofOfAddress-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-input bg-background hover:bg-muted transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or PDF (MAX. 5MB)</p>
                        </div>
                        <Input 
                          id="proofOfAddress-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, 'proofOfAddress')}
                          accept={ALLOWED_FILE_TYPES.join(',')}
                        />
                    </label>
                </div>
              </FormControl>
              {addressFileName && <p className="text-sm text-muted-foreground mt-2 flex items-center"><FileText size={16} className="mr-2 shrink-0" />{addressFileName}</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting Documents..." : "Submit for Verification"}
        </Button>
      </form>
    </Form>
  );
}

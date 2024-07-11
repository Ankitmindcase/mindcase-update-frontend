"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Dropzone, { Accept, FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  CloudArrowUpIcon,
  ArrowRightIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { FileDeleteDialog, FileItem } from "./SidebarFiles";
import { Flex, Text, Box } from "@radix-ui/themes";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRootStore } from "@/providers/RootProvider";
import { Loader2 } from "lucide-react";
import MultipleSelectCourt from "./MultipleSelectCourt";
import { Skeleton } from "@/components/ui/skeleton";

export const allowedFileTypes: Accept = {
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export function SidebarRight() {
  const { toast } = useToast();
  const supabase = createClient();
  const [filesLoad, setFilesLoad] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const StorageBucket: string = "internal_docs";
  const {
    workspaceId,
    setRightSidebarVisibility: setSidebar,
    rightSidebarVisible: sidebar,
  } = useRootStore((state) => state);
  const [checkedFiles, setCheckedFiles] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toggleSidebar = () => setSidebar(!sidebar);
  const [upload, setUpload] = useState<boolean>(false);
  const [deleteload, setdeleteload] = useState<boolean>(false);
  const [jurisdiction, setJurisdiction] = useState("All");

  const sortFilesAlphabetically = (files: File[]) => {
    return files.sort((a: any, b: any) => a.name.localeCompare(b.name));
  };

  const FilesError = (message: string) => {
    return toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: message,
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const handleDrop = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    if (fileRejections.length) {
      FilesError("Accept only .pdf , .txt , .docx");
    } else {
      handleFileUpload(acceptedFiles);
    }
  };

  const handleOnclickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const { type }: any = file;
    if (Object.values(allowedFileTypes).flat().includes(type)) {
      const files: any = [file];
      handleFileUpload(files);
    } else {
      FilesError("Accept only .pdf , .txt , .docx ");
    }
  };

  const handleFileRemove = async () => {
    setdeleteload(true);
    try {
      const filesToDelete = checkedFiles.map((index) => files[index]);
      const sortedByName: File[] = sortFilesAlphabetically(files);
      const fileNamesToDelete = filesToDelete.map(
        (file) => `${workspaceId}/${file.name}`
      );
      await supabase.storage.from("internal_docs").remove(fileNamesToDelete);
      const updatedFiles = sortedByName.filter(
        (_, index) => !checkedFiles.includes(index)
      );
      setdeleteload(false);
      setFiles(updatedFiles);
      setCheckedFiles([]);
    } catch (err) {
      setdeleteload(false);

      FilesError("Error in deleting files");
    }
  };

  const handleCheckboxChange = (index: number) => {
    if (checkedFiles.includes(index)) {
      setCheckedFiles((prev) => prev.filter((el) => el !== index));
    } else {
      setCheckedFiles((prev) => [...prev, index]);
    }
  };

  const OpenFileExplore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const DownloadFile = async () => {
    const sortedByName = sortFilesAlphabetically(files);
    const filesForDownload = checkedFiles.map((index) => sortedByName[index]);

    await Promise.all(
      filesForDownload.map(async (file) => {
        try {
          const response: any = await supabase.storage
            .from(StorageBucket)
            .download(`${workspaceId}/${file?.name}`);

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error(`Error downloading file ${file?.name}:`, error);
        }
      })
    );
  };

  const ValidateFile = (filename: string): boolean => {
    return files.some((file) => file?.name === filename);
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      await Promise.all(
        files.map(async (file) => {
          const AlreadyExists = ValidateFile(file.name);
          if (AlreadyExists) {
            return FilesError("File Already Exists");
          }
          setUpload(true);

          const filepath = `${workspaceId}/${file?.name}`;
          await supabase.storage.from(StorageBucket).upload(filepath, file, {
            cacheControl: "3600",
            upsert: true,
          });
          setFiles((pf: any) => [...pf, file]);
        })
      );
      setUpload(false);
    } catch (err) {
      FilesError("Error uploading file");
    } finally {
      setUpload(false);
    }
  };

  const getUploadedFiles = async (workspaceId: string) => {
    try {
      setFilesLoad(true);
      const { data } = await supabase.storage
        .from(StorageBucket)
        .list(`${workspaceId}/`);

      const mappedData: any = data?.map((file) => ({
        name: file.name,
        type: file?.metadata?.mimetype,
        size: file?.metadata?.size,
      }));

      setFiles(mappedData);
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
    } finally {
      setFilesLoad(false);
    }
  };

  useEffect(() => {
    getUploadedFiles(workspaceId);
  }, [workspaceId]);

  return (
    <Box
      className={cn(
        "relative h-full w-full flex flex-col md:max-w-[320px] border-r transition-all duration-500 bg-secondary text-sm",
        sidebar ? "shrink-0" : "mr-[-100%] md:mr-[-320px]"
      )}
    >
      <Toaster />

      <Box
        className={cn(
          "z-10 transition-opacity duration-500 flex items-center p-4"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
          className={cn("flex w-fit h-fit p-2 pl-0")}
        >
          <ArrowRightCircleIcon className={cn("w-5 h-auto text-primary")} />
        </Button>
        <Text className={cn("text-md font-medium whitespace-nowrap")}>
          Data Sources
        </Text>
      </Box>

      <div className="px-4 pb-0 flex flex-col h-[25%] w-full">
        <MultipleSelectCourt />
      </div>

      <Separator orientation="horizontal" />

      <div className="px-4 pt-2 flex flex-col h-[75%] w-full">
        <Flex justify="between" align="center">
          <Text className="font-semibold">Name</Text>
          {checkedFiles.length === 0 ? (
            <Button variant="link" className="p-0">
              <Link href={"/d"} shallow={true}>
                View All
              </Link>
              <ArrowRightIcon className="w-4 h-auto p-1" />
            </Button>
          ) : (
            <Flex direction="row" className="transition-all duration-100 gap-2">
              <FileDeleteDialog
                deleteload={deleteload}
                handleFileRemove={handleFileRemove}
              />
              <Button
                onClick={() => DownloadFile()}
                size="icon"
                variant="link"
                className="bg-blue-200"
              >
                <CloudArrowDownIcon className="w-[18px] h-[18px] text-black" />
              </Button>
            </Flex>
          )}
        </Flex>

        <ScrollArea className="w-full h-full">
          <Flex direction="column" className="">
            <Suspense fallback={<Loader2 className="w-5 h-5 animate-spin" />}>
              <Flex
                align="center"
                direction="column"
                className="max-h-[calc(60vh)] mt-1"
              >
                {filesLoad ? (
                  <div className="w-full flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  </div>
                ) : (
                  <ul className="flex flex-wrap justify-start align-middle w-full transition-all duration-100">
                    {files
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((file, index) => (
                        <FileItem
                          key={file.name + index}
                          index={index}
                          handleCheckboxChange={handleCheckboxChange}
                          file={file}
                          checkedFiles={checkedFiles}
                        />
                      ))}
                  </ul>
                )}
              </Flex>
            </Suspense>
          </Flex>
          <ScrollBar orientation="vertical" className="hidden" />
        </ScrollArea>

        <Box className="h-fit mb-1">
          <Dropzone onDrop={handleDrop} accept={allowedFileTypes}>
            {({ getRootProps, getInputProps }) => (
              <section
                {...getRootProps()}
                className="h-40 border-[1px] outline-dashed outline-slate-400 p-4 mt-1 mb-2 flex flex-col items-center justify-center text-center border-b-[1px] border-secondary bg-primary-foreground rounded-md"
              >
                <input {...getInputProps()} />
                <p>Drag and drop files here</p>
                <p className="text-sm text-gray-500">.pdf, .txt, .doc</p>
                <Box className="flex items-center space-x-2 mt-4">
                  <Button
                    size="sm"
                    className="w-fit text-xs"
                    onClick={() => OpenFileExplore()}
                  >
                    <Flex className="text-sm">
                      {upload ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-1" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="w-5 h-auto mr-1" />
                          Upload
                        </>
                      )}
                    </Flex>
                  </Button>
                </Box>
              </section>
            )}
          </Dropzone>
        </Box>
      </div>
    </Box>
  );
}

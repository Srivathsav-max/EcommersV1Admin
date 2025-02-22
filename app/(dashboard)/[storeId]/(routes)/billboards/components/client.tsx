"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { getColumns, BillboardColumn } from "./columns";

interface BillboardClientProps {
  data: BillboardColumn[];
  canManage: boolean;
}

export const BillboardClient: React.FC<BillboardClientProps> = ({
  data,
  canManage
}) => {
  const router = useRouter();
  const params = useParams();

  const columns = getColumns(canManage);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length})`}
          description="Manage billboards for your store"
        />
        {canManage && (
          <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      <Separator />
      <DataTable searchKey="label" columns={columns} data={data} />
      {canManage && (
        <>
          <Heading title="API" description="API Calls for Billboards" />
          <Separator />
          <ApiList entityName="billboards" entityIdName="billboardId" />
        </>
      )}
    </>
  );
};

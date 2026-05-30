import { PageHeader } from "@/components/dashboard/page-header";
import { CmsEditor } from "@/components/admin/cms-editor";
import { fetchSiteContent } from "@/lib/repos/content";

export const metadata = { title: "Contenido (CMS)" };

export default async function CmsPage() {
  const content = await fetchSiteContent();
  return (
    <div className="space-y-6">
      <PageHeader title="Contenido del sitio (CMS)" description="Edita el hero, la garantía, banners y FAQ sin tocar código" />
      <CmsEditor initial={content} />
    </div>
  );
}

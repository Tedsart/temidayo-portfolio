import { Container, Skeleton } from "@/components/ui/primitives";

export default function CaseStudyLoading() {
  return (
    <Container className="py-16 md:py-24" >
      <div className="space-y-4" role="status" aria-label="Loading case study">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-8">
          <Skeleton className="aspect-[16/9] w-full" />
        </div>
        <div className="grid gap-4 pt-10 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </Container>
  );
}

"use client";
import { Accordion } from "@/components/ui/accordion";
import Footer from "@/components/global/footer";
import Navbar from "@/components/global/navbar";
import { db } from "@/lib/firebase";
import { type Subject } from "@/types/firestore";
import SubjectBreadcrumb from "@/components/subject/subject-breadcrumb";
import SubjectSidebar from "@/components/subject/subject-sidebar";
import TableOfContents from "@/components/subject/table-of-contents";
import UnitAccordion from "@/components/subject/unit-accordion";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getUser } from "@/components/hooks/users";
import { type User } from "@/types/user";
import usePathname from "@/components/client/pathname";

const Page = ({ params }: { params: { slug: string } }) => {
  const pathname = usePathname();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await getUser();
        setUser(fetchedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser().catch((error) => {
      console.error("Error fetching user:", error);
    });
  }, []);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const docRef = doc(db, "subjects", params.slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubject(docSnap.data() as Subject);
        } else {
          setError("Subject not found. That's probably us, not you.");
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
        setError("Failed to fetch subject data.");
      } finally {
        setLoading(false);
      }
    };

    if (user !== undefined) {
      fetchSubject().catch((error) => {
        console.error("Error fetching user:", error);
      });
    }
  }, [user, params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-3xl">
        Loading...
      </div>
    );
  }
  if (error ?? !subject) {
    return (
      <div className="flex min-h-screen items-center justify-center text-3xl">
        {error}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      <SubjectSidebar subject={subject} />

      <div className="relative flex grow flex-col">
        <Navbar className="w-full px-10 xl:px-20" variant="secondary" />

        <div className="relative mt-[5.5rem] flex min-h-screen justify-between gap-x-16 px-10 xl:px-20">
          <div className="grow">
            <SubjectBreadcrumb locations={[subject.title]} />

            <h1 className="mb-9 mt-1 text-balance text-left text-5xl font-extrabold sm:text-6xl">
              {subject.title}
            </h1>

            <Accordion
              className="w-full"
              type="multiple"
              defaultValue={subject.units.map((unit) => unit.title)}
            >
              {subject.units.map((unit, unitIndex) => (
                <UnitAccordion
                  unit={unit}
                  unitIndex={unitIndex}
                  key={unitIndex}
                  pathname={pathname}
                />
              ))}
            </Accordion>
          </div>

          <TableOfContents title="UNITS" subject={subject} />
        </div>

        <Footer className="mx-0 w-full max-w-none px-10 xl:px-20" />
      </div>
    </div>
  );
};
export default Page;

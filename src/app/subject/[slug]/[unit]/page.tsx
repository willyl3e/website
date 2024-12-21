"use client";

import TestRenderer from "@/components/questions/testRenderer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { type UnitTest } from "@/types/firestore";
import { type QuestionFormat } from "@/types/questions";
import usePathname from "@/components/client/pathname";

const Page = () => {
  const pathname = usePathname();

  const instanceId = pathname.split("/").slice(-2).join("_");
  const collectionId = instanceId.split("_")[0];
  const unitId = instanceId.split("_")[1];

  const [time, setTime] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionFormat[] | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const docRef = doc(
          db,
          "subjects",
          collectionId!,
          `unit-${unitId}`,
          "test",
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UnitTest;

          const time = data.time;
          setTime((time && time / 60) ?? 20);

          const questionsData = data.questions;
          if (questionsData) {
            setQuestions(questionsData);
          } else {
            console.log("No questions found for this unit.");
          }
        } else {
          console.error("Subject document does not exist!");
        }
      } catch (error: unknown) {
        console.error("Error fetching subject data:", error);
      }
    };

    fetchQuestions().catch((error) => {
      console.error("Error fetching subject data:", error);
    });
  }, [collectionId, unitId]);

  // Render TestRenderer only for clients without admin privileges

  if (questions === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full p-4">
          <TestRenderer
            time={time}
            inputQuestions={questions}
            adminMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;

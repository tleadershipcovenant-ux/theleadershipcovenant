import ReactDOM from "react-dom";
import type { Metadata } from "next";
import ServicesPageView from "@/components/services/ServicesPageView";
import { SERVICES_PAGE } from "@/content/services";

export const metadata: Metadata = {
  title: "Our Services - The Leadership Covenant",
  description:
    "Leader in Me, LeaderU, Professional Development for educators, Leadership Camps, Family Sessions, Open Sessions and our podcast Change Starts Here.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  ReactDOM.preload(SERVICES_PAGE.hero.image.replace(/ /g, "%20"), {
    as: "image",
    fetchPriority: "high",
  });

  return <ServicesPageView />;
}

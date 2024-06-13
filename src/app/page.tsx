"use client";
import { MyMap } from "@/components/yandex-map";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <MyMap />
    </main>
  );
}

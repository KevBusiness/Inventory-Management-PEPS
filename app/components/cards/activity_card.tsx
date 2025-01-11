import { Notification, User } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { getTimeElapsed } from "~/lib/utils";

interface Data extends Notification {
  user: User;
}

export default function ActivityCard({
  index,
  data,
}: {
  index: number;
  data: Data;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ duration: 0.2, delay: index * 0.2 }}
        className="border rounded-md p-2 h-[90px] space-y-1 shadow-md bg-gradient-to-br from-neutral-50/20 to-neutral-100/50"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-semibold text-blue-500">
            {data.concept}
          </h1>
          <span className="text-sm font-semibold">
            {getTimeElapsed(data.createdAt)}
          </span>
        </div>
        <p className="text-sm">{data.activity}</p>
        <p className="text-sm">
          Realizada por {data.user.name} {data.user.lastname}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

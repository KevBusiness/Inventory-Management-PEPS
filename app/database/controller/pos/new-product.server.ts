import db from "~/database/prisma.server";
import {
  unstable_parseMultipartFormData,
  createRequestHandler,
} from "@remix-run/node";
import multer from "multer";

export async function makeProduct(formData: FormData) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage }).single("picture");

  try {
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { postData } from "@/functions/postData";
import { Data } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

import nbApartment from "../../data/nbApartment.json";
import filter from "../../data/filter.json";
import pushNotification from "@/functions/pushNotification";

const { NTFY_URL, SELOGER_URL } = process.env;

const SECRET_CHANNEL =
  process.env.NODE_ENV === "development"
    ? process.env.SECRET_CHANNEL_DEV
    : process.env.SECRET_CHANNEL;

const url = process.env.URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const response = await postData(SELOGER_URL, filter);

    if (req.query.reset) {
      nbApartment.lastCount = 0;
    } else if (nbApartment.lastCount !== response.nb) {
      if (nbApartment.lastCount < response.nb && nbApartment.lastCount !== 0)
        await fetch(
          `${NTFY_URL}${SECRET_CHANNEL}`,
          pushNotification(response, nbApartment)
        );
      nbApartment.lastCount = response.nb;
    }
    res.json({ message: "Good!" });
  } catch (err) {
    res.json({ error: "failed to load data" });
  }
}
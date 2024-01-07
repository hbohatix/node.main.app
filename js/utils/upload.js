import path from "path";
import formidable from "formidable";
import shortid from "shortid";
import fs from "fs";
import { getModel } from "./model-manager.js";
import logger from "./logger.js";
import config from "../../config.js";

// - save uploaded file to server (no DB involved)
export function uploadOne(req, res) {
  logger.logReq("UPLOAD ONE", req);

  const m = getModel(req.params.entity);
  const id = req.params.id;
  const form = new formidable.IncomingForm();
  let fname,
    ffname,
    dup = false;

  form.multiples = false;
  form.uploadDir = path.join(config.uploadPath, "/" + m.id);

  form
    .on("file", function (field, file) {
      fname = file.name;
      ffname = form.uploadDir + "/" + fname;

      if (fs.existsSync(ffname)) {
        // - if duplicate name do not overwrite file but postfix name
        let idx = ffname.lastIndexOf(".");
        const xtra = "_" + shortid.generate(),
          originalName = fname;

        dup = true;
        ffname = idx
          ? ffname.slice(0, idx) + xtra + ffname.slice(idx)
          : ffname + xtra;
        idx = ffname.lastIndexOf("/");
        fname = ffname.slice(idx + 1);
        logger.logSuccess(
          'New file name: "' + originalName + '" -> "' + fname + '".'
        );
      }
      fs.rename(file.path, ffname, function (err) {
        if (err) throw err;
      });
    })
    .on("end", function () {
      logger.logSuccess('Saved file: "' + ffname + '".');
      res.json({
        duplicate: dup,
        fileName: fname,
        id: id,
        model: m.id,
      });
    })
    .on("error", function (err) {
      logger.logError(err);
      res.json({
        error: true,
        uploaded: false,
      });
    });

  form.parse(req);
}

export default {
  uploadOne,
};

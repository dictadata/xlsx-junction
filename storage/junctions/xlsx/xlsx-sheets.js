// originally copied from XLSX.utils in SheetsJS js-xlsx project's xlsx.js file.
"use strict";

const { SSF, utils } = require('xlsx');
const { hasOwnProperty } = require("@dictadata/storage-junctions").utils;

const encode_cell = utils.encode_cell;
const encode_col = utils.encode_col;
const encode_row = utils.encode_row;
const encode_range = utils.encode_range;

const decode_cell = utils.decode_cell;
const decode_col = utils.decode_col;
const decode_row = utils.decode_row;
const decode_range = utils.decode_range;
//const safe_decode_range = utils.???;   // not exported from XLSX.utils

const split_cell = utils.split_cell;
//const format_cell = utils.format_cell; // might want to modify

var basedate = new Date(1899, 11, 30, 0, 0, 0); // 2209161600000

function datenum(v, date1904) {
  var epoch = v.getTime();
  if (date1904) epoch -= 1462 * 24 * 60 * 60 * 1000;
  var dnthresh = basedate.getTime() + (v.getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;
  return (epoch - dnthresh) / (24 * 60 * 60 * 1000);
}

function safe_format_cell(cell, v) {
  var q = (cell.t == 'd' && v instanceof Date);

  if (cell.z != null)
    try {
      return (cell.w = SSF.format(cell.z, q ? datenum(v) : v));
    }
    catch (e) {}

  try {
    return (cell.w = SSF.format((cell.XF || {}).numFmtId || (q ? 14 : 0), q ? datenum(v) : v));
  }
  catch (e) {
    return '' + v;
  }
}

function format_cell(cell, v, o) {
  if (cell == null || cell.t == null || cell.t == 'z')
    return "";
  if (cell.w !== undefined)
    return cell.w;
  if (cell.t == 'd' && !cell.z && o && o.dateNF)
    cell.z = o.dateNF;
  if (v == undefined)
    return safe_format_cell(cell, cell.v);
  return safe_format_cell(cell, v);
}

function safe_decode_range(range) {
  var o = {
    s: { c: 0, r: 0 },
    e: { c: 0, r: 0 }
  };
  var idx = 0;
  var i = 0;
  var cc = 0;
  var len = range.length;
  for (idx = 0; i < len; ++i) {
    if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
    idx = 26 * idx + cc;
  }
  o.s.c = --idx;

  for (idx = 0; i < len; ++i) {
    if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
    idx = 10 * idx + cc;
  }
  o.s.r = --idx;

  if (i === len || range.charCodeAt(++i) === 58) {
    o.e.c = o.s.c;
    o.e.r = o.s.r;
    return o;
  }

  for (idx = 0; i != len; ++i) {
    if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
    idx = 26 * idx + cc;
  }
  o.e.c = --idx;

  for (idx = 0; i != len; ++i) {
    if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
    idx = 10 * idx + cc;
  }
  o.e.r = --idx;
  return o;
}

/* get cell, creating a stub if necessary */
function ws_get_cell_stub(ws, R, C) {

  /* A1 cell address */
  if (typeof R == "string") {
    /* dense */
    if (Array.isArray(ws)) {
      var RC = decode_cell(R);
      if (!ws[RC.r]) ws[RC.r] = [];
      return ws[RC.r][RC.c] || (ws[RC.r][RC.c] = { t: 'z' });
    }
    return ws[R] || (ws[R] = { t: 'z' });
  }

  /* cell address object */
  if (typeof R != "number")
    return ws_get_cell_stub(ws, encode_cell(R));

  /* R and C are 0-based indices */
  return ws_get_cell_stub(ws, encode_cell({ r: R, c: C || 0 }));
}
let sheet_get_cell = ws_get_cell_stub;

function keys(o) {
  var ks = Object.keys(o);
  var o2 = [];

  for (var i = 0; i < ks.length; ++i)
    if (hasOwnProperty(o, ks[i]))
      o2.push(ks[i]);

  return o2;
}

exports.sheet_delete = function (wb, name) {
  let i = wb.SheetNames.indexOf(name);
  if (i >= 0) {
    wb.SheetNames.splice(i, 1);
    delete wb.Sheets[name];
  }
}

let sheet_add_json = exports.sheet_add_json = function (_ws, js, opts) {
  var o = opts || {};
  var offset = +!o.skipHeader;
  var ws = _ws || ({});
  var _R = 0;
  var _C = 0;

  if (ws && o.origin != null) {
    if (typeof o.origin == 'number') {
      _R = o.origin;
    }
    else {
      var _origin = typeof o.origin == "string" ? decode_cell(o.origin) : o.origin;
      _R = _origin.r;
      _C = _origin.c;
    }
  }

  var cell;
  var range = ({
    s: { c: 0, r: 0 },
    e: { c: _C, r: _R + js.length - 1 + offset }
  });

  if (ws['!ref']) {
    var _range = safe_decode_range(ws['!ref']);
    range.e.c = Math.max(range.e.c, _range.e.c);
    range.e.r = Math.max(range.e.r, _range.e.r);
    if (_R == -1) {
      _R = range.e.r + 1;
      range.e.r = _R + js.length - 1 + offset;
    }
  }

  var hdr = o.header || [],
    C = 0;

  js.forEach(function (JS, R) {
    keys(JS).forEach(function (k) {
      if ((C = hdr.indexOf(k)) == -1)
        hdr[C = hdr.length] = k;

      var v = JS[k];
      var t = 'z';
      var z = "";

      var ref = encode_cell({
        c: _C + C,
        r: _R + R + offset
      });

      cell = sheet_get_cell(ws, ref);

      if (v && typeof v === 'object' && !(v instanceof Date)) {
        ws[ref] = v;
      }
      else {
        if (typeof v == 'number') t = 'n';
        else if (typeof v == 'boolean') t = 'b';
        else if (typeof v == 'string') t = 's';
        else if (v instanceof Date) {
          t = 'd';
          if (!o.cellDates) {
            t = 'n';
            v = datenum(v);
          }
          z = (o.dateNF || SSF._table[14]);
        }

        if (!cell)
          ws[ref] = cell = ({ t: t, v: v });
        else {
          cell.t = t;
          cell.v = v;
          delete cell.w;
          delete cell.R;
          if (z) cell.z = z;
        }

        if (z)
          cell.z = z;
      }
    });
  });

  range.e.c = Math.max(range.e.c, _C + hdr.length - 1);
  var __R = encode_row(_R);
  if (offset)
    for (C = 0; C < hdr.length; ++C)
      ws[encode_col(C + _C) + __R] = { t: 's', v: hdr[C] };

  ws['!ref'] = encode_range(range);
  return ws;
}

exports.json_to_sheet = function (js, opts) {
  return sheet_add_json(null, js, opts);
}


function make_json_row(sheet, r, R, cols, header, hdr, dense, o) {
  var rr = encode_row(R);
  var defval = o.defval;
  var raw = hasOwnProperty(o, "raw") ? o.raw : true;
  var isempty = true;
  var row = (header === 1) ? [] : {};

  if (header !== 1) {
    if (Object.defineProperty) try {
      Object.defineProperty(row, '__rowNum__', {
        value: R,
        enumerable: false
      });
    } catch (e) {
      row.__rowNum__ = R;
    }
    else row.__rowNum__ = R;
  }

  if (!dense || sheet[R])
    for (var C = r.s.c; C <= r.e.c; ++C) {
      var val = dense ? sheet[R][C] : sheet[cols[C] + rr];
      if (val === undefined || val.t === undefined) {
        if (defval === undefined) continue;
        if (hdr[C] != null) {
          row[hdr[C]] = defval;
        }
        continue;
      }
      var v = val.v;
      switch (val.t) {
        case 'z':
          if (v == null) break;
          continue;
        case 'e':
          v = void 0;
          break;
        case 's':
        case 'd':
        case 'b':
        case 'n':
          break;
        default:
          throw new StorageError({ statusCode: 400 }, 'unrecognized type ' + val.t);
      }
      if (hdr[C] != null) {
        if (v == null) {
          if (defval !== undefined) row[hdr[C]] = defval;
          else if (raw && v === null) row[hdr[C]] = null;
          else continue;
        } else {
          row[hdr[C]] = raw ? v : format_cell(val, v, o);
        }
        if (v != null) isempty = false;
      }
    }
  return {
    row: row,
    isempty: isempty
  };
}

exports.sheet_to_json = function (sheet, opts) {
  if (sheet == null || sheet["!ref"] == null)
    return [];

  var val = { t: "n", v: 0 };
  var header = 0;
  var offset = 1;
  var hdr = [];
  var v = 0;
  var vv = "";

  var r = {
    s: { r: 0, c: 0 },
    e: { r: 0, c: 0 }
  };

  var o = opts || {};
  var range = o.range != null ? o.range : sheet["!ref"];

  if (o.header === 1) header = 1;
  else if (o.header === "A") header = 2;
  else if (Array.isArray(o.header)) header = 3;
  else if (o.header == null) header = 0;

  let _range = safe_decode_range(sheet["!ref"]);
  switch (typeof range) {
    case "string":
      r = safe_decode_range(range);
      if (r.e.c === r.s.c) r.e.c = _range.e.c;
      if (r.e.r === r.s.r) r.e.r = _range.e.r;
      break;
    case "number":
      r = _range;
      r.s.r = range;
      break;
    default:
      r = range;
  }

  if (header > 0) offset = 0;
  var rr = encode_row(r.s.r);
  var cols = [];
  var out = [];
  var outi = 0;
  var counter = 0;
  var dense = Array.isArray(sheet);
  var R = r.s.r;
  var C = 0;
  var CC = 0;

  if (dense && !sheet[R]) sheet[R] = [];

  for (C = r.s.c; C <= r.e.c; ++C) {
    cols[C] = encode_col(C);
    val = dense ? sheet[R][C] : sheet[cols[C] + rr];

    switch (header) {
      case 1:
        hdr[C] = C - r.s.c;
        break;
      case 2:
        hdr[C] = cols[C];
        break;
      case 3:
        hdr[C] = o.header[C - r.s.c];
        break;
      default:
        if (val == null)
          val = { w: "__EMPTY", t: "s" };
        vv = v = format_cell(val, null, o);

        counter = 0;
        for (CC = 0; CC < hdr.length; ++CC)
          if (hdr[CC] == vv) vv = v + "_" + ++counter;

        hdr[C] = vv;
    }
  }

  for (R = r.s.r + offset; R <= r.e.r; ++R) {
    var row = make_json_row(sheet, r, R, cols, header, hdr, dense, o);
    if (row.isempty === false ||
      (header === 1 ? o.blankrows !== false : !!o.blankrows)
    )
      out[outi++] = row.row;
  }

  out.length = outi;
  return out;
}


exports.write_json_stream = function (sheet, opts) {
  var stream = Readable({
    objectMode: true
  });

  if (sheet == null || sheet["!ref"] == null) {
    stream.push(null);
    return stream;
  }

  var val = { t: 'n', v: 0 }
  var header = 0;
  var offset = 1;
  var hdr = [];
  var v = 0;
  var vv = "";
  var r = {
    s: { r: 0, c: 0 },
    e: { r: 0, c: 0 }
  };
  var o = opts || {};
  var range = o.range != null ? o.range : sheet["!ref"];

  if (o.header === 1) header = 1;
  else if (o.header === "A") header = 2;
  else if (Array.isArray(o.header)) header = 3;

  let _range = safe_decode_range(sheet["!ref"]);
  switch (typeof range) {
    case "string":
      r = safe_decode_range(range);
      if (r.e.c === r.s.c) r.e.c = _range.e.c;
      if (r.e.r === r.s.r) r.e.r = _range.e.r;
      break;
    case "number":
      r = _range;
      r.s.r = range;
      break;
    default:
      r = range;
  }

  if (header > 0) offset = 0;
  var rr = encode_row(r.s.r);
  var cols = [];
  var counter = 0;
  var dense = Array.isArray(sheet);
  var R = r.s.r;
  var C = 0;
  var CC = 0;

  if (dense && !sheet[R]) sheet[R] = [];

  for (C = r.s.c; C <= r.e.c; ++C) {
    cols[C] = encode_col(C);
    val = dense ? sheet[R][C] : sheet[cols[C] + rr];
    switch (header) {
      case 1:
        hdr[C] = C - r.s.c;
        break;
      case 2:
        hdr[C] = cols[C];
        break;
      case 3:
        hdr[C] = o.header[C - r.s.c];
        break;
      default:
        if (val == null) val = { w: "__EMPTY", t: "s" };
        vv = v = format_cell(val, null, o);
        counter = 0;
        for (CC = 0; CC < hdr.length; ++CC)
          if (hdr[CC] == vv) vv = v + "_" + (++counter);
        hdr[C] = vv;
    }
  }

  R = r.s.r + offset;

  stream._read = function (size) {
    if (R > r.e.r)
      return stream.push(null);

    let cnt = 0;
    while (R <= r.e.r) {
      //if ((rowinfo[R-1]||{}).hidden) continue;
      var row = make_json_row(sheet, r, R, cols, header, hdr, dense, o);
      ++R;

      if ((row.isempty === false) || (header === 1 ? o.blankrows !== false : !!o.blankrows)) {
        stream.push(row.row);
        if (++cnt >= size)
          break;
      }
    }
  };

  return stream;
};

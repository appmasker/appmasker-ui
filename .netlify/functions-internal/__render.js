var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, Readable, wm, Blob, fetchBlob, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new fetchBlob([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse2;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse2(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/ssr.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session2 = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session: session2
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session2.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page.path)},
						query: new URLSearchParams(${s$1(page.query.toString())}),
						params: ${s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base, path) {
  const base_match = absolute.exec(base);
  const path_match = absolute.exec(path);
  const baseparts = path_match ? [] : base.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: {
              "content-type": asset.type
            }
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith(options2.paths.base)) {
          const relative = resolved.replace(options2.paths.base, "");
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (error4) {
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e) {
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page
    });
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    const preface = `Invalid response from route ${request.path}`;
    if (response) {
      if (typeof response !== "object") {
        return error(`${preface}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      const is_type_textual = isContentTypeTextual(type);
      if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
        return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
      }
      let normalized_body;
      if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
        headers = { ...headers, "content-type": "application/json; charset=utf-8" };
        normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  if (typeof raw === "string") {
    const [type, ...directives] = headers["content-type"].split(/;\s*/);
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var cookie = __toModule(require_cookie());
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
function compute_slots(slots) {
  const result = {};
  for (const key in slots) {
    result[key] = true;
  }
  return result;
}
function custom_event(type, detail, bubbles = false) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, false, detail);
  return e;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(type, detail);
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
    }
  };
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var flushing = false;
var seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, classes_to_add) {
  const attributes = Object.assign({}, ...args);
  if (classes_to_add) {
    if (attributes.class == null) {
      attributes.class = classes_to_add;
    } else {
      attributes.class += " " + classes_to_add;
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function escape_attribute_value(value) {
  return typeof value === "string" ? escape2(value) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
  return classes ? ` class="${classes}"` : "";
}
function afterUpdate() {
}
var css$b = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$b);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
async function getSession({ headers }) {
  const cookies = cookie.parse(headers.cookie || "");
  const hasAuthCookie = !!(cookies == null ? void 0 : cookies["auth"]);
  return {
    isAuthenticated: hasAuthCookie
  };
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  getSession
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="AppMasker icon" href="/appmask-ico.png" />\n		<link rel="stylesheet" href="/styles.css" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-5579edb7.js",
      css: ["/./_app/assets/start-a8cd1609.css"],
      js: ["/./_app/start-5579edb7.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/singletons-bb9012b7.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      if (error22.frame) {
        console.error(error22.frame);
      }
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: false,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "appmask-ico.png", "size": 1373, "type": "image/png" }, { "file": "images/3rd-party/powered-by-stripe.svg", "size": 3600, "type": "image/svg+xml" }, { "file": "images/appmasker-logo.svg", "size": 4124, "type": "image/svg+xml" }, { "file": "styles.css", "size": 619, "type": "text/css" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "endpoint",
      pattern: /^\/$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index$3;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/dashboard\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index$2;
      })
    },
    {
      type: "page",
      pattern: /^\/dashboard\/account\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/account.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/billing\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/billing.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/domains\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/domains.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/help\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/help.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/dashboard\/api\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index$1;
      })
    },
    {
      type: "page",
      pattern: /^\/dashboard\/api\/api-keys\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/api/api-keys.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/dashboard\/api\/docs\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/dashboard/api/docs.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/auth\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index;
      })
    },
    {
      type: "page",
      pattern: /^\/auth\/signup\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/auth/signup.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/auth\/login\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/auth/login.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/dashboard/account.svelte": () => Promise.resolve().then(function() {
    return account;
  }),
  "src/routes/dashboard/billing.svelte": () => Promise.resolve().then(function() {
    return billing;
  }),
  "src/routes/dashboard/domains.svelte": () => Promise.resolve().then(function() {
    return domains;
  }),
  "src/routes/dashboard/help.svelte": () => Promise.resolve().then(function() {
    return help;
  }),
  "src/routes/dashboard/api/api-keys.svelte": () => Promise.resolve().then(function() {
    return apiKeys;
  }),
  "src/routes/dashboard/api/docs.svelte": () => Promise.resolve().then(function() {
    return docs;
  }),
  "src/routes/auth/signup.svelte": () => Promise.resolve().then(function() {
    return signup;
  }),
  "src/routes/auth/login.svelte": () => Promise.resolve().then(function() {
    return login;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-d2cde4cc.js", "css": ["/./_app/assets/pages/__layout.svelte-15f94d7a.css"], "js": ["/./_app/pages/__layout.svelte-d2cde4cc.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/user.state-7cf1189d.js"], "styles": null }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-328d6df2.js", "css": [], "js": ["/./_app/error.svelte-328d6df2.js", "/./_app/chunks/vendor-050d8cbf.js"], "styles": null }, "src/routes/dashboard/account.svelte": { "entry": "/./_app/pages/dashboard/account.svelte-1e660a88.js", "css": [], "js": ["/./_app/pages/dashboard/account.svelte-1e660a88.js", "/./_app/chunks/vendor-050d8cbf.js"], "styles": null }, "src/routes/dashboard/billing.svelte": { "entry": "/./_app/pages/dashboard/billing.svelte-02162063.js", "css": ["/./_app/assets/pages/dashboard/billing.svelte-584a678c.css"], "js": ["/./_app/pages/dashboard/billing.svelte-02162063.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/effects-a8062ecc.js", "/./_app/chunks/api-utils-e88dc490.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/store-utils-3fdd23c5.js", "/./_app/chunks/user.state-7cf1189d.js", "/./_app/chunks/user-32a9ba32.js"], "styles": null }, "src/routes/dashboard/domains.svelte": { "entry": "/./_app/pages/dashboard/domains.svelte-6896720a.js", "css": ["/./_app/assets/pages/dashboard/domains.svelte-ed1e5c30.css"], "js": ["/./_app/pages/dashboard/domains.svelte-6896720a.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/store-utils-3fdd23c5.js", "/./_app/chunks/api-utils-e88dc490.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/user.state-7cf1189d.js", "/./_app/chunks/user-32a9ba32.js"], "styles": null }, "src/routes/dashboard/help.svelte": { "entry": "/./_app/pages/dashboard/help.svelte-fa19f5ff.js", "css": [], "js": ["/./_app/pages/dashboard/help.svelte-fa19f5ff.js", "/./_app/chunks/vendor-050d8cbf.js"], "styles": null }, "src/routes/dashboard/api/api-keys.svelte": { "entry": "/./_app/pages/dashboard/api/api-keys.svelte-731e6dd2.js", "css": ["/./_app/assets/pages/dashboard/api/api-keys.svelte-e3f36a55.css"], "js": ["/./_app/pages/dashboard/api/api-keys.svelte-731e6dd2.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/effects-a8062ecc.js", "/./_app/chunks/api-utils-e88dc490.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/store-utils-3fdd23c5.js", "/./_app/chunks/user.state-7cf1189d.js"], "styles": null }, "src/routes/dashboard/api/docs.svelte": { "entry": "/./_app/pages/dashboard/api/docs.svelte-62bb70ce.js", "css": ["/./_app/assets/pages/dashboard/api/docs.svelte-0952e1bf.css"], "js": ["/./_app/pages/dashboard/api/docs.svelte-62bb70ce.js", "/./_app/chunks/vendor-050d8cbf.js"], "styles": null }, "src/routes/auth/signup.svelte": { "entry": "/./_app/pages/auth/signup.svelte-340c5fc9.js", "css": ["/./_app/assets/pages/auth/signup.svelte-eabe59f2.css"], "js": ["/./_app/pages/auth/signup.svelte-340c5fc9.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/api-utils-e88dc490.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/user.state-7cf1189d.js"], "styles": null }, "src/routes/auth/login.svelte": { "entry": "/./_app/pages/auth/login.svelte-cb17e67a.js", "css": ["/./_app/assets/pages/auth/signup.svelte-eabe59f2.css"], "js": ["/./_app/pages/auth/login.svelte-cb17e67a.js", "/./_app/chunks/vendor-050d8cbf.js", "/./_app/chunks/api-utils-e88dc490.js", "/./_app/chunks/singletons-bb9012b7.js", "/./_app/chunks/user.state-7cf1189d.js"], "styles": null } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
async function get$3() {
  return {
    headers: { Location: "/dashboard/domains" },
    status: 302
  };
}
var index$3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$3
});
async function get$2() {
  return {
    headers: { Location: "/dashboard/domains" },
    status: 302
  };
}
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$2
});
async function get$1() {
  return {
    headers: { Location: "/dashboard/api/docs" },
    status: 302
  };
}
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get() {
  return {
    headers: { Location: "/auth/login" },
    status: 302
  };
}
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
async function authGuard(url, isAuthenticated) {
  if (isAuthenticated && url.includes("/auth")) {
    return { status: 302, redirect: "/dashboard" };
  } else if (isAuthenticated || url.includes("/auth")) {
    return {};
  } else {
    return { status: 302, redirect: "/auth" };
  }
}
var SkipToContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "tabindex"]);
  let { href = "#main-content" } = $$props;
  let { tabindex = "0" } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  return `<a${spread([
    { href: escape_attribute_value(href) },
    {
      tabindex: escape_attribute_value(tabindex)
    },
    escape_object($$restProps)
  ], "bx--skip-to-content")}>${slots.default ? slots.default({}) : `Skip to main content`}</a>`;
});
var SideNavLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["isSelected", "href", "text", "icon", "ref"]);
  let { isSelected = false } = $$props;
  let { href = void 0 } = $$props;
  let { text = void 0 } = $$props;
  let { icon = void 0 } = $$props;
  let { ref = null } = $$props;
  if ($$props.isSelected === void 0 && $$bindings.isSelected && isSelected !== void 0)
    $$bindings.isSelected(isSelected);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<li${add_classes(["bx--side-nav__item"].join(" ").trim())}><a${spread([
    {
      "aria-current": escape_attribute_value(isSelected ? "page" : void 0)
    },
    { href: escape_attribute_value(href) },
    {
      rel: escape_attribute_value($$restProps.target === "_blank" ? "noopener noreferrer" : void 0)
    },
    escape_object($$restProps)
  ], "bx--side-nav__link " + (isSelected ? "bx--side-nav__link--current" : ""))}${add_attribute("this", ref, 0)}>${icon ? `<div${add_classes([
    "bx--side-nav__icon bx--side-nav__icon--small"
  ].join(" ").trim())}>${validate_component(icon || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</div>` : ``}
    <span${add_classes(["bx--side-nav__link-text"].join(" ").trim())}>${escape2(text)}</span></a></li>`;
});
var SideNavItems = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<ul${add_classes(["bx--side-nav__items"].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</ul>`;
});
var subscriber_queue2 = [];
function readable(value, start) {
  return {
    subscribe: writable2(value, start).subscribe
  };
}
function writable2(value, start = noop2) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue2.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop2;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let inited = false;
    const values = [];
    let pending = 0;
    let cleanup = noop2;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop2;
      }
    };
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (inited) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    inited = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
    };
  });
}
var shouldRenderHamburgerMenu = writable2(false);
var SideNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["fixed", "rail", "ariaLabel", "isOpen", "expansionBreakpoint"]);
  let { fixed = false } = $$props;
  let { rail = false } = $$props;
  let { ariaLabel = void 0 } = $$props;
  let { isOpen = false } = $$props;
  let { expansionBreakpoint = 1056 } = $$props;
  const dispatch = createEventDispatcher();
  let winWidth = void 0;
  if ($$props.fixed === void 0 && $$bindings.fixed && fixed !== void 0)
    $$bindings.fixed(fixed);
  if ($$props.rail === void 0 && $$bindings.rail && rail !== void 0)
    $$bindings.rail(rail);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.expansionBreakpoint === void 0 && $$bindings.expansionBreakpoint && expansionBreakpoint !== void 0)
    $$bindings.expansionBreakpoint(expansionBreakpoint);
  {
    dispatch(isOpen ? "open" : "close");
  }
  return `

${!fixed ? `<div${add_classes([
    "bx--side-nav__overlay " + (isOpen ? "bx--side-nav__overlay-active" : "")
  ].join(" ").trim())}></div>` : ``}
<nav${spread([
    {
      "aria-hidden": escape_attribute_value(!isOpen)
    },
    {
      "aria-label": escape_attribute_value(ariaLabel)
    },
    escape_object($$restProps)
  ], "bx--side-nav__navigation bx--side-nav bx--side-nav--ux " + ((rail && winWidth >= expansionBreakpoint ? false : isOpen) ? "bx--side-nav--expanded" : "") + " " + (!isOpen && !rail ? "bx--side-nav--collapsed" : "") + " " + (rail ? "bx--side-nav--rail" : ""))}>${slots.default ? slots.default({}) : ``}</nav>`;
});
var Row = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let props;
  let $$restProps = compute_rest_props($$props, ["as", "condensed", "narrow", "noGutter", "noGutterLeft", "noGutterRight", "padding"]);
  let { as = false } = $$props;
  let { condensed = false } = $$props;
  let { narrow = false } = $$props;
  let { noGutter = false } = $$props;
  let { noGutterLeft = false } = $$props;
  let { noGutterRight = false } = $$props;
  let { padding = false } = $$props;
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.condensed === void 0 && $$bindings.condensed && condensed !== void 0)
    $$bindings.condensed(condensed);
  if ($$props.narrow === void 0 && $$bindings.narrow && narrow !== void 0)
    $$bindings.narrow(narrow);
  if ($$props.noGutter === void 0 && $$bindings.noGutter && noGutter !== void 0)
    $$bindings.noGutter(noGutter);
  if ($$props.noGutterLeft === void 0 && $$bindings.noGutterLeft && noGutterLeft !== void 0)
    $$bindings.noGutterLeft(noGutterLeft);
  if ($$props.noGutterRight === void 0 && $$bindings.noGutterRight && noGutterRight !== void 0)
    $$bindings.noGutterRight(noGutterRight);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  props = {
    ...$$restProps,
    class: [
      $$restProps.class,
      "bx--row",
      condensed && "bx--row--condensed",
      narrow && "bx--row--narrow",
      noGutter && "bx--no-gutter",
      noGutterLeft && "bx--no-gutter--left",
      noGutterRight && "bx--no-gutter--right",
      padding && "bx--row-padding"
    ].filter(Boolean).join(" ")
  };
  return `${as ? `${slots.default ? slots.default({ props }) : ``}` : `<div${spread([escape_object(props)])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
var HeaderNavItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "text", "isSelected", "ref"]);
  let { href = void 0 } = $$props;
  let { text = void 0 } = $$props;
  let { isSelected = false } = $$props;
  let { ref = null } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.isSelected === void 0 && $$bindings.isSelected && isSelected !== void 0)
    $$bindings.isSelected(isSelected);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<li><a${spread([
    { role: "menuitem" },
    { tabindex: "0" },
    { href: escape_attribute_value(href) },
    {
      rel: escape_attribute_value($$restProps.target === "_blank" ? "noopener noreferrer" : void 0)
    },
    {
      "aria-current": escape_attribute_value(isSelected ? "page" : void 0)
    },
    escape_object($$restProps)
  ], "bx--header__menu-item")}${add_attribute("this", ref, 0)}><span${add_classes(["bx--text-truncate--end"].join(" ").trim())}>${escape2(text)}</span></a></li>`;
});
var HeaderNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let props;
  let $$restProps = compute_rest_props($$props, ["ariaLabel"]);
  let { ariaLabel = void 0 } = $$props;
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  props = {
    "aria-label": ariaLabel || $$props["aria-label"],
    "aria-labelledby": $$props["aria-labelledby"]
  };
  return `<nav${spread([escape_object(props), escape_object($$restProps)], "bx--header__nav")}><ul${spread([escape_object(props)], "bx--header__menu-bar")}>${slots.default ? slots.default({}) : ``}</ul></nav>`;
});
var Close20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "Close20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var Menu20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "Menu20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 20 20" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M2 14.8H18V16H2zM2 11.2H18V12.399999999999999H2zM2 7.6H18V8.799999999999999H2zM2 4H18V5.2H2z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var HamburgerMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["ariaLabel", "isOpen", "iconMenu", "iconClose", "ref"]);
  let { ariaLabel = void 0 } = $$props;
  let { isOpen = false } = $$props;
  let { iconMenu = Menu20 } = $$props;
  let { iconClose = Close20 } = $$props;
  let { ref = null } = $$props;
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0)
    $$bindings.ariaLabel(ariaLabel);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  if ($$props.iconMenu === void 0 && $$bindings.iconMenu && iconMenu !== void 0)
    $$bindings.iconMenu(iconMenu);
  if ($$props.iconClose === void 0 && $$bindings.iconClose && iconClose !== void 0)
    $$bindings.iconClose(iconClose);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<button${spread([
    { type: "button" },
    { title: escape_attribute_value(ariaLabel) },
    {
      "aria-label": escape_attribute_value(ariaLabel)
    },
    escape_object($$restProps)
  ], "bx--header__action bx--header__menu-trigger bx--header__menu-toggle")}${add_attribute("this", ref, 0)}>${validate_component((isOpen ? iconClose : iconMenu) || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</button>`;
});
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let $$restProps = compute_rest_props($$props, [
    "expandedByDefault",
    "isSideNavOpen",
    "uiShellAriaLabel",
    "href",
    "company",
    "platformName",
    "persistentHamburgerMenu",
    "expansionBreakpoint",
    "ref",
    "iconMenu",
    "iconClose"
  ]);
  let $shouldRenderHamburgerMenu, $$unsubscribe_shouldRenderHamburgerMenu;
  $$unsubscribe_shouldRenderHamburgerMenu = subscribe(shouldRenderHamburgerMenu, (value) => $shouldRenderHamburgerMenu = value);
  let { expandedByDefault = true } = $$props;
  let { isSideNavOpen = false } = $$props;
  let { uiShellAriaLabel = void 0 } = $$props;
  let { href = void 0 } = $$props;
  let { company = void 0 } = $$props;
  let { platformName = "" } = $$props;
  let { persistentHamburgerMenu = false } = $$props;
  let { expansionBreakpoint = 1056 } = $$props;
  let { ref = null } = $$props;
  let { iconMenu = Menu20 } = $$props;
  let { iconClose = Close20 } = $$props;
  let winWidth = void 0;
  if ($$props.expandedByDefault === void 0 && $$bindings.expandedByDefault && expandedByDefault !== void 0)
    $$bindings.expandedByDefault(expandedByDefault);
  if ($$props.isSideNavOpen === void 0 && $$bindings.isSideNavOpen && isSideNavOpen !== void 0)
    $$bindings.isSideNavOpen(isSideNavOpen);
  if ($$props.uiShellAriaLabel === void 0 && $$bindings.uiShellAriaLabel && uiShellAriaLabel !== void 0)
    $$bindings.uiShellAriaLabel(uiShellAriaLabel);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.company === void 0 && $$bindings.company && company !== void 0)
    $$bindings.company(company);
  if ($$props.platformName === void 0 && $$bindings.platformName && platformName !== void 0)
    $$bindings.platformName(platformName);
  if ($$props.persistentHamburgerMenu === void 0 && $$bindings.persistentHamburgerMenu && persistentHamburgerMenu !== void 0)
    $$bindings.persistentHamburgerMenu(persistentHamburgerMenu);
  if ($$props.expansionBreakpoint === void 0 && $$bindings.expansionBreakpoint && expansionBreakpoint !== void 0)
    $$bindings.expansionBreakpoint(expansionBreakpoint);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  if ($$props.iconMenu === void 0 && $$bindings.iconMenu && iconMenu !== void 0)
    $$bindings.iconMenu(iconMenu);
  if ($$props.iconClose === void 0 && $$bindings.iconClose && iconClose !== void 0)
    $$bindings.iconClose(iconClose);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    isSideNavOpen = expandedByDefault && winWidth >= expansionBreakpoint && !persistentHamburgerMenu;
    ariaLabel = company ? `${company} ` : "" + (uiShellAriaLabel || $$props["aria-label"] || platformName);
    $$rendered = `

<header role="${"banner"}"${add_attribute("aria-label", ariaLabel, 0)}${add_classes(["bx--header"].join(" ").trim())}>${slots["skip-to-content"] ? slots["skip-to-content"]({}) : ``}
  ${$shouldRenderHamburgerMenu && winWidth < expansionBreakpoint || persistentHamburgerMenu ? `${validate_component(HamburgerMenu, "HamburgerMenu").$$render($$result, {
      iconClose,
      iconMenu,
      isOpen: isSideNavOpen
    }, {
      isOpen: ($$value) => {
        isSideNavOpen = $$value;
        $$settled = false;
      }
    }, {})}` : ``}
  <a${spread([{ href: escape_attribute_value(href) }, escape_object($$restProps)], "bx--header__name")}${add_attribute("this", ref, 0)}>${company ? `<span${add_classes(["bx--header__name--prefix"].join(" ").trim())}>${escape2(company)}\xA0</span>` : ``}
    ${slots.platform ? slots.platform({}) : `${escape2(platformName)}`}</a>
  ${slots.default ? slots.default({}) : ``}</header>`;
  } while (!$$settled);
  $$unsubscribe_shouldRenderHamburgerMenu();
  return $$rendered;
});
var Grid = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let props;
  let $$restProps = compute_rest_props($$props, [
    "as",
    "condensed",
    "narrow",
    "fullWidth",
    "noGutter",
    "noGutterLeft",
    "noGutterRight",
    "padding"
  ]);
  let { as = false } = $$props;
  let { condensed = false } = $$props;
  let { narrow = false } = $$props;
  let { fullWidth = false } = $$props;
  let { noGutter = false } = $$props;
  let { noGutterLeft = false } = $$props;
  let { noGutterRight = false } = $$props;
  let { padding = false } = $$props;
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.condensed === void 0 && $$bindings.condensed && condensed !== void 0)
    $$bindings.condensed(condensed);
  if ($$props.narrow === void 0 && $$bindings.narrow && narrow !== void 0)
    $$bindings.narrow(narrow);
  if ($$props.fullWidth === void 0 && $$bindings.fullWidth && fullWidth !== void 0)
    $$bindings.fullWidth(fullWidth);
  if ($$props.noGutter === void 0 && $$bindings.noGutter && noGutter !== void 0)
    $$bindings.noGutter(noGutter);
  if ($$props.noGutterLeft === void 0 && $$bindings.noGutterLeft && noGutterLeft !== void 0)
    $$bindings.noGutterLeft(noGutterLeft);
  if ($$props.noGutterRight === void 0 && $$bindings.noGutterRight && noGutterRight !== void 0)
    $$bindings.noGutterRight(noGutterRight);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  props = {
    ...$$restProps,
    class: [
      $$restProps.class,
      "bx--grid",
      condensed && "bx--grid--condensed",
      narrow && "bx--grid--narrow",
      fullWidth && "bx--grid--full-width",
      noGutter && "bx--no-gutter",
      noGutterLeft && "bx--no-gutter--left",
      noGutterRight && "bx--no-gutter--right",
      padding && "bx--row-padding"
    ].filter(Boolean).join(" ")
  };
  return `${as ? `${slots.default ? slots.default({ props }) : ``}` : `<div${spread([escape_object(props)])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
var Content = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["id"]);
  let { id = "main-content" } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  return `<main${spread([{ id: escape_attribute_value(id) }, escape_object($$restProps)], "bx--content")}>${slots.default ? slots.default({}) : ``}</main>`;
});
var Column = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let columnClass;
  let props;
  let $$restProps = compute_rest_props($$props, [
    "as",
    "noGutter",
    "noGutterLeft",
    "noGutterRight",
    "padding",
    "aspectRatio",
    "sm",
    "md",
    "lg",
    "xlg",
    "max"
  ]);
  let { as = false } = $$props;
  let { noGutter = false } = $$props;
  let { noGutterLeft = false } = $$props;
  let { noGutterRight = false } = $$props;
  let { padding = false } = $$props;
  let { aspectRatio = void 0 } = $$props;
  let { sm = void 0 } = $$props;
  let { md = void 0 } = $$props;
  let { lg = void 0 } = $$props;
  let { xlg = void 0 } = $$props;
  let { max = void 0 } = $$props;
  const breakpoints = ["sm", "md", "lg", "xlg", "max"];
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.noGutter === void 0 && $$bindings.noGutter && noGutter !== void 0)
    $$bindings.noGutter(noGutter);
  if ($$props.noGutterLeft === void 0 && $$bindings.noGutterLeft && noGutterLeft !== void 0)
    $$bindings.noGutterLeft(noGutterLeft);
  if ($$props.noGutterRight === void 0 && $$bindings.noGutterRight && noGutterRight !== void 0)
    $$bindings.noGutterRight(noGutterRight);
  if ($$props.padding === void 0 && $$bindings.padding && padding !== void 0)
    $$bindings.padding(padding);
  if ($$props.aspectRatio === void 0 && $$bindings.aspectRatio && aspectRatio !== void 0)
    $$bindings.aspectRatio(aspectRatio);
  if ($$props.sm === void 0 && $$bindings.sm && sm !== void 0)
    $$bindings.sm(sm);
  if ($$props.md === void 0 && $$bindings.md && md !== void 0)
    $$bindings.md(md);
  if ($$props.lg === void 0 && $$bindings.lg && lg !== void 0)
    $$bindings.lg(lg);
  if ($$props.xlg === void 0 && $$bindings.xlg && xlg !== void 0)
    $$bindings.xlg(xlg);
  if ($$props.max === void 0 && $$bindings.max && max !== void 0)
    $$bindings.max(max);
  columnClass = [sm, md, lg, xlg, max].map((breakpoint, i) => {
    const name = breakpoints[i];
    if (breakpoint === true) {
      return `bx--col-${name}`;
    } else if (typeof breakpoint === "number") {
      return `bx--col-${name}-${breakpoint}`;
    } else if (typeof breakpoint === "object") {
      let bp = [];
      if (typeof breakpoint.span === "number") {
        bp = [...bp, `bx--col-${name}-${breakpoint.span}`];
      } else if (breakpoint.span === true) {
        bp = [...bp, `bx--col-${name}`];
      }
      if (typeof breakpoint.offset === "number") {
        bp = [...bp, `bx--offset-${name}-${breakpoint.offset}`];
      }
      return bp.join(" ");
    }
  }).filter(Boolean).join(" ");
  props = {
    ...$$restProps,
    class: [
      $$restProps.class,
      columnClass,
      !columnClass && "bx--col",
      noGutter && "bx--no-gutter",
      noGutterLeft && "bx--no-gutter--left",
      noGutterRight && "bx--no-gutter--right",
      aspectRatio && `bx--aspect-ratio bx--aspect-ratio--${aspectRatio}`,
      padding && "bx--col-padding"
    ].filter(Boolean).join(" ")
  };
  return `${as ? `${slots.default ? slots.default({ props }) : ``}` : `<div${spread([escape_object(props)])}>${slots.default ? slots.default({}) : ``}</div>`}`;
});
var ssr = typeof window === "undefined";
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var error$1 = (verb) => {
  throw new Error(ssr ? `Can only ${verb} session store in browser` : `Cannot ${verb} session store before subscribing`);
};
var session = {
  subscribe(fn) {
    const store = getStores().session;
    if (!ssr) {
      session.set = store.set;
      session.update = store.update;
    }
    return store.subscribe(fn);
  },
  set: (value) => {
    error$1("set");
  },
  update: (updater) => {
    error$1("update");
  }
};
var NotificationButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["notificationType", "icon", "title", "iconDescription"]);
  let { notificationType = "toast" } = $$props;
  let { icon = Close20 } = $$props;
  let { title = void 0 } = $$props;
  let { iconDescription = "Close icon" } = $$props;
  if ($$props.notificationType === void 0 && $$bindings.notificationType && notificationType !== void 0)
    $$bindings.notificationType(notificationType);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  return `
<button${spread([
    { type: "button" },
    {
      "aria-label": escape_attribute_value(iconDescription)
    },
    {
      title: escape_attribute_value(iconDescription)
    },
    escape_object($$restProps)
  ], (notificationType === "toast" ? "bx--toast-notification__close-button" : "") + " " + (notificationType === "inline" ? "bx--inline-notification__close-button" : ""))}>${validate_component(icon || missing_component, "svelte:component").$$render($$result, {
    title,
    class: "bx--" + notificationType + "-notification__close-icon"
  }, {}, {})}</button>`;
});
var CheckmarkFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "CheckmarkFilled20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 20 20" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M10,1c-4.9,0-9,4.1-9,9s4.1,9,9,9s9-4,9-9S15,1,10,1z M8.7,13.5l-3.2-3.2l1-1l2.2,2.2l4.8-4.8l1,1L8.7,13.5z"}"></path><path fill="${"none"}" d="${"M8.7,13.5l-3.2-3.2l1-1l2.2,2.2l4.8-4.8l1,1L8.7,13.5z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var ErrorFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ErrorFilled20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 20 20" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M13.5,14.5l-8-8l1-1l8,8L13.5,14.5z"}"></path><path d="${"M13.5,14.5l-8-8l1-1l8,8L13.5,14.5z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var InformationFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    {
      "data-carbon-icon": "InformationFilled20"
    },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path fill="${"none"}" d="${"M16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,13.875H17.125v-8H13v2.25h1.875v5.75H12v2.25h8Z"}" data-icon-path="${"inner-path"}"></path><path d="${"M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var InformationSquareFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    {
      "data-carbon-icon": "InformationSquareFilled20"
    },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path fill="${"none"}" d="${"M16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,13.875H17.125v-8H13v2.25h1.875v5.75H12v2.25h8Z"}" data-icon-path="${"inner-path"}"></path><path d="${"M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var WarningFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "WarningFilled20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 20 20" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1	s1,0.4,1,1S10.6,16,10,16z"}"></path><path d="${"M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var WarningAltFilled20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "WarningAltFilled20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path fill="${"none"}" d="${"M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z"}" data-icon-path="${"inner-path"}"></path><path d="${"M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"}"></path><path d="${"M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var NotificationIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { kind = "error" } = $$props;
  let { notificationType = "toast" } = $$props;
  let { iconDescription = "Closes notification" } = $$props;
  const icons = {
    error: ErrorFilled20,
    "info-square": InformationSquareFilled20,
    info: InformationFilled20,
    success: CheckmarkFilled20,
    warning: WarningFilled20,
    "warning-alt": WarningAltFilled20
  };
  if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0)
    $$bindings.kind(kind);
  if ($$props.notificationType === void 0 && $$bindings.notificationType && notificationType !== void 0)
    $$bindings.notificationType(notificationType);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  return `${validate_component(icons[kind] || missing_component, "svelte:component").$$render($$result, {
    title: iconDescription,
    class: "bx--" + notificationType + "-notification__icon"
  }, {}, {})}`;
});
var NotificationTextDetails = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { notificationType = "toast" } = $$props;
  let { title = "Title" } = $$props;
  let { subtitle = "" } = $$props;
  let { caption = "Caption" } = $$props;
  if ($$props.notificationType === void 0 && $$bindings.notificationType && notificationType !== void 0)
    $$bindings.notificationType(notificationType);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0)
    $$bindings.subtitle(subtitle);
  if ($$props.caption === void 0 && $$bindings.caption && caption !== void 0)
    $$bindings.caption(caption);
  return `${notificationType === "toast" ? `<div${add_classes(["bx--toast-notification__details"].join(" ").trim())}><h3${add_classes(["bx--toast-notification__title"].join(" ").trim())}>${escape2(title)}</h3>
    <div${add_classes(["bx--toast-notification__subtitle"].join(" ").trim())}>${escape2(subtitle)}</div>
    <div${add_classes(["bx--toast-notification__caption"].join(" ").trim())}>${escape2(caption)}</div>
    ${slots.default ? slots.default({}) : ``}</div>` : ``}

${notificationType === "inline" ? `<div${add_classes(["bx--inline-notification__text-wrapper"].join(" ").trim())}><p${add_classes(["bx--inline-notification__title"].join(" ").trim())}>${escape2(title)}</p>
    <div${add_classes(["bx--inline-notification__subtitle"].join(" ").trim())}>${escape2(subtitle)}</div>
    ${slots.default ? slots.default({}) : ``}</div>` : ``}`;
});
var ToastNotification = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "kind",
    "lowContrast",
    "timeout",
    "role",
    "title",
    "subtitle",
    "caption",
    "iconDescription",
    "hideCloseButton"
  ]);
  let { kind = "error" } = $$props;
  let { lowContrast = false } = $$props;
  let { timeout: timeout2 = 0 } = $$props;
  let { role = "alert" } = $$props;
  let { title = "" } = $$props;
  let { subtitle = "" } = $$props;
  let { caption = "" } = $$props;
  let { iconDescription = "Closes notification" } = $$props;
  let { hideCloseButton = false } = $$props;
  createEventDispatcher();
  if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0)
    $$bindings.kind(kind);
  if ($$props.lowContrast === void 0 && $$bindings.lowContrast && lowContrast !== void 0)
    $$bindings.lowContrast(lowContrast);
  if ($$props.timeout === void 0 && $$bindings.timeout && timeout2 !== void 0)
    $$bindings.timeout(timeout2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0)
    $$bindings.subtitle(subtitle);
  if ($$props.caption === void 0 && $$bindings.caption && caption !== void 0)
    $$bindings.caption(caption);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  if ($$props.hideCloseButton === void 0 && $$bindings.hideCloseButton && hideCloseButton !== void 0)
    $$bindings.hideCloseButton(hideCloseButton);
  return `
${`<div${spread([
    { role: escape_attribute_value(role) },
    { kind: escape_attribute_value(kind) },
    escape_object($$restProps)
  ], "bx--toast-notification " + (lowContrast ? "bx--toast-notification--low-contrast" : "") + " " + (kind === "error" ? "bx--toast-notification--error" : "") + " " + (kind === "info" ? "bx--toast-notification--info" : "") + " " + (kind === "info-square" ? "bx--toast-notification--info-square" : "") + " " + (kind === "success" ? "bx--toast-notification--success" : "") + " " + (kind === "warning" ? "bx--toast-notification--warning" : "") + " " + (kind === "warning-alt" ? "bx--toast-notification--warning-alt" : ""))}>${validate_component(NotificationIcon, "NotificationIcon").$$render($$result, { kind }, {}, {})}
    ${validate_component(NotificationTextDetails, "NotificationTextDetails").$$render($$result, { title, subtitle, caption }, {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}
    ${!hideCloseButton ? `${validate_component(NotificationButton, "NotificationButton").$$render($$result, { iconDescription }, {}, {})}` : ``}</div>`}`;
});
var BACKEND_HOST = "http://localhost:3000";
var BUSINESS_STANDARD_PRICE_ID = "price_1JiUwOHZNZE3BaVXJsloqnt8";
var createDomain$ = writable2({ data: null, isLoading: false });
var accountDomains$ = writable2({
  data: { count: 0, domains: [] },
  isLoading: false
});
var generateApiKey$ = writable2({
  data: null,
  isLoading: false
});
var currentUserInitialState = { data: null, isLoading: false };
var currentUser$ = writable2(currentUserInitialState);
var showNotification$ = writable2({});
var css$a = {
  code: ".notification-container.svelte-x38avg{z-index:100000;position:absolute;top:50px;right:2rem}",
  map: `{"version":3,"file":"NotificationPopup.svelte","sources":["NotificationPopup.svelte"],"sourcesContent":["<script lang=\\"ts\\">import ToastNotification from \\"carbon-components-svelte/src/Notification/ToastNotification.svelte\\";\\nimport { onDestroy } from 'svelte';\\nimport { showNotification$ } from '../store';\\nlet showNotification = false;\\nconst timeout = 7500;\\nconst sub = showNotification$.subscribe((state) => {\\n    if ((state === null || state === void 0 ? void 0 : state.title) || (state === null || state === void 0 ? void 0 : state.message)) {\\n        showNotification = true;\\n        setTimeout(() => {\\n            showNotification = false;\\n        }, timeout);\\n    }\\n});\\nonDestroy(sub);\\n<\/script>\\n\\n{#if showNotification}\\n\\t<div class=\\"notification-container\\">\\n\\t\\t<ToastNotification\\n\\t\\t\\ttitle={$showNotification$.title}\\n\\t\\t\\tkind={$showNotification$.kind}\\n\\t\\t\\tsubtitle={$showNotification$.message}\\n\\t\\t\\t{timeout}\\n\\t\\t/>\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t.notification-container {\\n\\t\\tz-index: 100000;\\n\\t\\tposition: absolute;\\n\\t\\ttop: 50px;\\n\\t\\tright: 2rem;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4BC,uBAAuB,cAAC,CAAC,AACxB,OAAO,CAAE,MAAM,CACf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,KAAK,CAAE,IAAI,AACZ,CAAC"}`
};
var timeout = 7500;
var NotificationPopup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $showNotification$, $$unsubscribe_showNotification$;
  $$unsubscribe_showNotification$ = subscribe(showNotification$, (value) => $showNotification$ = value);
  let showNotification = false;
  const sub = showNotification$.subscribe((state) => {
    if ((state === null || state === void 0 ? void 0 : state.title) || (state === null || state === void 0 ? void 0 : state.message)) {
      showNotification = true;
      setTimeout(() => {
        showNotification = false;
      }, timeout);
    }
  });
  onDestroy(sub);
  $$result.css.add(css$a);
  $$unsubscribe_showNotification$();
  return `${showNotification ? `<div class="${"notification-container svelte-x38avg"}">${validate_component(ToastNotification, "ToastNotification").$$render($$result, {
    title: $showNotification$.title,
    kind: $showNotification$.kind,
    subtitle: $showNotification$.message,
    timeout
  }, {}, {})}</div>` : ``}`;
});
var css$9 = {
  code: "img.logo.svelte-fzpv2l{height:1.3em;position:relative;right:18px}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script lang=\\"ts\\" context=\\"module\\">import { session } from '$app/stores';\\nimport Column from \\"carbon-components-svelte/src/Grid/Column.svelte\\";\\nimport Content from \\"carbon-components-svelte/src/UIShell/Content.svelte\\";\\nimport Grid from \\"carbon-components-svelte/src/Grid/Grid.svelte\\";\\nimport Header from \\"carbon-components-svelte/src/UIShell/GlobalHeader/Header.svelte\\";\\nimport HeaderNav from \\"carbon-components-svelte/src/UIShell/GlobalHeader/HeaderNav.svelte\\";\\nimport HeaderNavItem from \\"carbon-components-svelte/src/UIShell/GlobalHeader/HeaderNavItem.svelte\\";\\nimport Row from \\"carbon-components-svelte/src/Grid/Row.svelte\\";\\nimport SideNav from \\"carbon-components-svelte/src/UIShell/SideNav/SideNav.svelte\\";\\nimport SideNavItems from \\"carbon-components-svelte/src/UIShell/SideNav/SideNavItems.svelte\\";\\nimport SideNavLink from \\"carbon-components-svelte/src/UIShell/SideNav/SideNavLink.svelte\\";\\nimport SkipToContent from \\"carbon-components-svelte/src/UIShell/SkipToContent.svelte\\";\\nimport 'carbon-components-svelte/css/g10.css';\\nimport { authGuard } from '../services/guards';\\nexport async function load(params) {\\n    const session = params.session;\\n    return await authGuard(params.page.path, session.isAuthenticated);\\n}\\n<\/script>\\n\\n<script lang=\\"ts\\">import NotificationPopup from '../components/NotificationPopup.svelte';\\nlet isSideNavOpen = false;\\nlet links = [\\n    { text: 'Domains', href: '/dashboard/domains' },\\n    // { text: 'Account', href: '/dashboard/account' },\\n    { text: 'API', href: '/dashboard/api' },\\n    { text: 'Billing', href: '/dashboard/billing' },\\n    { text: 'Help', href: '/dashboard/help' }\\n];\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>AppMasker</title>\\n</svelte:head>\\n\\n<NotificationPopup />\\n\\n<Header\\n\\tcompany=\\"AppMasker\\"\\n\\tplatformName=\\"\\"\\n\\tpersistentHamburgerMenu={false}\\n\\texpandedByDefault={false}\\n\\tbind:isSideNavOpen\\n>\\n\\t<div slot=\\"skip-to-content\\">\\n\\t\\t<SkipToContent />\\n\\t</div>\\n\\n\\t<img class=\\"logo\\" src=\\"/images/appmasker-logo.svg\\" alt=\\"AppMasker Logo\\" />\\n\\n\\t{#if $session.isAuthenticated}\\n\\t\\t<HeaderNav>\\n\\t\\t\\t{#each links as link}\\n\\t\\t\\t\\t<HeaderNavItem href={link.href} text={link.text} />\\n\\t\\t\\t{/each}\\n\\t\\t\\t<!-- <HeaderNavMenu text=\\"Menu\\">\\n      <HeaderNavItem href=\\"/\\" text=\\"Link 1\\" />\\n    </HeaderNavMenu> -->\\n\\t\\t</HeaderNav>\\n\\t{/if}\\n</Header>\\n{#if $session.isAuthenticated}\\n\\t<SideNav bind:isOpen={isSideNavOpen}>\\n\\t\\t<SideNavItems>\\n\\t\\t\\t{#each links as link}\\n\\t\\t\\t\\t<SideNavLink href={link.href} on:click={() => (isSideNavOpen = false)} text={link.text} />\\n\\t\\t\\t{/each}\\n\\t\\t\\t<!-- <SideNavMenu text=\\"Menu\\">\\n      <SideNavMenuItem href=\\"/\\" text=\\"Link 1\\" />\\n    </SideNavMenu> -->\\n\\t\\t</SideNavItems>\\n\\t</SideNav>\\n{/if}\\n\\n<Content>\\n\\t<Grid>\\n\\t\\t<Row>\\n\\t\\t\\t<Column>\\n\\t\\t\\t\\t<slot />\\n\\t\\t\\t</Column>\\n\\t\\t</Row>\\n\\t</Grid>\\n</Content>\\n\\n<style>\\n\\timg.logo {\\n\\t\\theight: 1.3em;\\n\\t\\tposition: relative;\\n\\t\\tright: 18px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAqFC,GAAG,KAAK,cAAC,CAAC,AACT,MAAM,CAAE,KAAK,CACb,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,AACZ,CAAC"}`
};
async function load$1(params) {
  const session2 = params.session;
  return await authGuard(params.page.path, session2.isAuthenticated);
}
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $session, $$unsubscribe_session;
  $$unsubscribe_session = subscribe(session, (value) => $session = value);
  let isSideNavOpen = false;
  let links = [
    {
      text: "Domains",
      href: "/dashboard/domains"
    },
    { text: "API", href: "/dashboard/api" },
    {
      text: "Billing",
      href: "/dashboard/billing"
    },
    { text: "Help", href: "/dashboard/help" }
  ];
  $$result.css.add(css$9);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `${$$result.title = `<title>AppMasker</title>`, ""}`, ""}

${validate_component(NotificationPopup, "NotificationPopup").$$render($$result, {}, {}, {})}

${validate_component(Header, "Header").$$render($$result, {
      company: "AppMasker",
      platformName: "",
      persistentHamburgerMenu: false,
      expandedByDefault: false,
      isSideNavOpen
    }, {
      isSideNavOpen: ($$value) => {
        isSideNavOpen = $$value;
        $$settled = false;
      }
    }, {
      "skip-to-content": () => `<div slot="${"skip-to-content"}">${validate_component(SkipToContent, "SkipToContent").$$render($$result, {}, {}, {})}</div>`,
      default: () => `<img class="${"logo svelte-fzpv2l"}" src="${"/images/appmasker-logo.svg"}" alt="${"AppMasker Logo"}">

	${$session.isAuthenticated ? `${validate_component(HeaderNav, "HeaderNav").$$render($$result, {}, {}, {
        default: () => `${each(links, (link) => `${validate_component(HeaderNavItem, "HeaderNavItem").$$render($$result, { href: link.href, text: link.text }, {}, {})}`)}
			`
      })}` : ``}`
    })}
${$session.isAuthenticated ? `${validate_component(SideNav, "SideNav").$$render($$result, { isOpen: isSideNavOpen }, {
      isOpen: ($$value) => {
        isSideNavOpen = $$value;
        $$settled = false;
      }
    }, {
      default: () => `${validate_component(SideNavItems, "SideNavItems").$$render($$result, {}, {}, {
        default: () => `${each(links, (link) => `${validate_component(SideNavLink, "SideNavLink").$$render($$result, { href: link.href, text: link.text }, {}, {})}`)}
			`
      })}`
    })}` : ``}

${validate_component(Content, "Content").$$render($$result, {}, {}, {
      default: () => `${validate_component(Grid, "Grid").$$render($$result, {}, {}, {
        default: () => `${validate_component(Row, "Row").$$render($$result, {}, {}, {
          default: () => `${validate_component(Column, "Column").$$render($$result, {}, {}, {
            default: () => `${slots.default ? slots.default({}) : ``}`
          })}`
        })}`
      })}`
    })}`;
  } while (!$$settled);
  $$unsubscribe_session();
  return $$rendered;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout,
  load: load$1
});
function load({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var Account = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Account</h1>

<div class="${"block"}">
</div>`;
});
var account = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Account
});
var ButtonSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "size", "small"]);
  let { href = void 0 } = $$props;
  let { size = "default" } = $$props;
  let { small = false } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.small === void 0 && $$bindings.small && small !== void 0)
    $$bindings.small(small);
  return `
${href ? `<a${spread([
    { href: escape_attribute_value(href) },
    {
      rel: escape_attribute_value($$restProps.target === "_blank" ? "noopener noreferrer" : void 0)
    },
    { role: "button" },
    escape_object($$restProps)
  ], "bx--skeleton bx--btn " + (size === "field" ? "bx--btn--field" : "") + " " + (size === "small" || small ? "bx--btn--sm" : "") + " " + (size === "lg" ? "bx--btn--lg" : "") + " " + (size === "xl" ? "bx--btn--xl" : ""))}>${escape2("")}</a>` : `<div${spread([escape_object($$restProps)], "bx--skeleton bx--btn " + (size === "field" ? "bx--btn--field" : "") + " " + (size === "small" || small ? "bx--btn--sm" : "") + " " + (size === "lg" ? "bx--btn--lg" : "") + " " + (size === "xl" ? "bx--btn--xl" : ""))}></div>`}`;
});
var Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let buttonProps;
  let $$restProps = compute_rest_props($$props, [
    "kind",
    "size",
    "expressive",
    "isSelected",
    "hasIconOnly",
    "icon",
    "iconDescription",
    "tooltipAlignment",
    "tooltipPosition",
    "as",
    "skeleton",
    "disabled",
    "href",
    "tabindex",
    "type",
    "ref"
  ]);
  let $$slots = compute_slots(slots);
  let { kind = "primary" } = $$props;
  let { size = "default" } = $$props;
  let { expressive = false } = $$props;
  let { isSelected = false } = $$props;
  let { hasIconOnly = false } = $$props;
  let { icon = void 0 } = $$props;
  let { iconDescription = void 0 } = $$props;
  let { tooltipAlignment = "center" } = $$props;
  let { tooltipPosition = "bottom" } = $$props;
  let { as = false } = $$props;
  let { skeleton = false } = $$props;
  let { disabled = false } = $$props;
  let { href = void 0 } = $$props;
  let { tabindex = "0" } = $$props;
  let { type = "button" } = $$props;
  let { ref = null } = $$props;
  const ctx = getContext("ComposedModal");
  if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0)
    $$bindings.kind(kind);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.expressive === void 0 && $$bindings.expressive && expressive !== void 0)
    $$bindings.expressive(expressive);
  if ($$props.isSelected === void 0 && $$bindings.isSelected && isSelected !== void 0)
    $$bindings.isSelected(isSelected);
  if ($$props.hasIconOnly === void 0 && $$bindings.hasIconOnly && hasIconOnly !== void 0)
    $$bindings.hasIconOnly(hasIconOnly);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  if ($$props.tooltipAlignment === void 0 && $$bindings.tooltipAlignment && tooltipAlignment !== void 0)
    $$bindings.tooltipAlignment(tooltipAlignment);
  if ($$props.tooltipPosition === void 0 && $$bindings.tooltipPosition && tooltipPosition !== void 0)
    $$bindings.tooltipPosition(tooltipPosition);
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.skeleton === void 0 && $$bindings.skeleton && skeleton !== void 0)
    $$bindings.skeleton(skeleton);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  {
    if (ctx && ref) {
      ctx.declareRef(ref);
    }
  }
  hasIconOnly = icon && !$$slots.default;
  buttonProps = {
    type: href && !disabled ? void 0 : type,
    tabindex,
    disabled: disabled === true ? true : void 0,
    href,
    "aria-pressed": hasIconOnly && kind === "ghost" ? isSelected : void 0,
    ...$$restProps,
    class: [
      "bx--btn",
      expressive && "bx--btn--expressive",
      (size === "small" && !expressive || size === "sm" && !expressive || size === "small" && !expressive) && "bx--btn--sm",
      size === "field" && !expressive || size === "md" && !expressive && "bx--btn--md",
      size === "field" && "bx--btn--field",
      size === "small" && "bx--btn--sm",
      size === "lg" && "bx--btn--lg",
      size === "xl" && "bx--btn--xl",
      kind && `bx--btn--${kind}`,
      disabled && "bx--btn--disabled",
      hasIconOnly && "bx--btn--icon-only",
      hasIconOnly && "bx--tooltip__trigger",
      hasIconOnly && "bx--tooltip--a11y",
      hasIconOnly && tooltipPosition && `bx--btn--icon-only--${tooltipPosition}`,
      hasIconOnly && tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`,
      hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
      $$restProps.class
    ].filter(Boolean).join(" ")
  };
  return `
${skeleton ? `${validate_component(ButtonSkeleton, "ButtonSkeleton").$$render($$result, Object.assign({ href }, { size }, $$restProps, { style: hasIconOnly && "width: 3rem;" }), {}, {})}` : `${as ? `${slots.default ? slots.default({ props: buttonProps }) : ``}` : `${href && !disabled ? `
  <a${spread([escape_object(buttonProps)])}${add_attribute("this", ref, 0)}>${hasIconOnly ? `<span${add_classes(["bx--assistive-text"].join(" ").trim())}>${escape2(iconDescription)}</span>` : ``}
    ${slots.default ? slots.default({}) : ``}${validate_component(icon || missing_component, "svelte:component").$$render($$result, {
    "aria-hidden": "true",
    class: "bx--btn__icon",
    "aria-label": iconDescription
  }, {}, {})}</a>` : `<button${spread([escape_object(buttonProps)])}${add_attribute("this", ref, 0)}>${hasIconOnly ? `<span${add_classes(["bx--assistive-text"].join(" ").trim())}>${escape2(iconDescription)}</span>` : ``}
    ${slots.default ? slots.default({}) : ``}${validate_component(icon || missing_component, "svelte:component").$$render($$result, {
    "aria-hidden": "true",
    class: "bx--btn__icon",
    "aria-label": iconDescription
  }, {}, {})}</button>`}`}`}`;
});
var Tile = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["light"]);
  let { light = false } = $$props;
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  return `
<div${spread([escape_object($$restProps)], "bx--tile " + (light ? "bx--tile--light" : ""))}>${slots.default ? slots.default({}) : ``}</div>`;
});
var CurrencyDollar32 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "CurrencyDollar32" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "32" },
    { height: "32" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M23,20.5151c0-4.6152-3.78-5.1411-6.8171-5.563-3.31-.4609-5.1829-.86-5.1829-3.71C11,8.8491,13.5071,8,15.6538,8a6.7538,6.7538,0,0,1,5.5681,2.6279l1.5562-1.2558A8.6508,8.6508,0,0,0,17,6.0962V3H15V6.022c-3.6152.2192-6,2.26-6,5.22,0,4.73,3.83,5.2627,6.9075,5.69C19.16,17.3848,21,17.7744,21,20.5151,21,23.5474,17.8674,24,16,24c-3.4294,0-4.8782-.9639-6.2219-2.6279L8.2219,22.6279A8.4382,8.4382,0,0,0,15,25.9648V29h2V25.9551C20.7256,25.6509,23,23.6279,23,20.5151Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var AccountType;
(function(AccountType2) {
  AccountType2["STANDARD"] = "standard";
  AccountType2["HOSTIFI"] = "hostifi";
  AccountType2["NONE"] = "none";
  AccountType2["UNLIMITED"] = "unlimited";
})(AccountType || (AccountType = {}));
function toDomainForm(domainConfig) {
  var _a, _b, _c, _d;
  try {
    return {
      ...domainConfig,
      name: (_a = domainConfig.name) != null ? _a : "",
      ipAddresses: (_c = (_b = domainConfig.ipAddresses) == null ? void 0 : _b.join(",")) != null ? _c : "",
      data: JSON.stringify(domainConfig.data, null, 2),
      redirects: (_d = domainConfig.redirects) != null ? _d : []
    };
  } catch (error22) {
    console.error(error22);
    return {};
  }
}
var UserRole;
(function(UserRole2) {
  UserRole2["SUPER_ADMIN"] = "super-admin";
  UserRole2["ACCOUNT_OWNER"] = "account-owner";
})(UserRole || (UserRole = {}));
var isSubscribed = (accountType) => {
  switch (accountType) {
    case AccountType.STANDARD:
    case AccountType.UNLIMITED:
      return true;
    default:
      return false;
  }
};
var CheckmarkFilled16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "CheckmarkFilled16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M8,1C4.1,1,1,4.1,1,8c0,3.9,3.1,7,7,7s7-3.1,7-7C15,4.1,11.9,1,8,1z M7,11L4.3,8.3l0.9-0.8L7,9.3l4-3.9l0.9,0.8L7,11z"}"></path><path d="${"M7,11L4.3,8.3l0.9-0.8L7,9.3l4-3.9l0.9,0.8L7,11z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var css$8 = {
  code: ".stripe-logo.svelte-18g0buj{height:3em;width:auto}.subscribed.svelte-18g0buj{display:flex;align-items:center}",
  map: `{"version":3,"file":"billing.svelte","sources":["billing.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { getCurrentUser } from './../../store/effects';\\nimport Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nimport CurrencyDollar32 from 'carbon-icons-svelte/lib/CurrencyDollar32';\\nimport { currentUser$ } from '../../store';\\nimport { BACKEND_HOST, BUSINESS_STANDARD_PRICE_ID } from '../../utils/environment';\\nimport { isSubscribed } from '../../utils/billing';\\nimport CheckmarkFilled16 from 'carbon-icons-svelte/lib/CheckmarkFilled16';\\nimport { onMount } from 'svelte';\\nonMount(() => {\\n    getCurrentUser.dispatch();\\n});\\n<\/script>\\n\\n<h1>Billing</h1>\\n\\n<div class=\\"block\\">\\n\\t<Tile>\\n\\t\\t<h3>Free Trial</h3>\\n\\t\\t<ul class=\\"block\\">\\n\\t\\t\\t<li>Create 2 domains to try out AppMasker</li>\\n\\t\\t\\t<li>No Credit Card required</li>\\n\\t\\t</ul>\\n\\t</Tile>\\n</div>\\n<div class=\\"block\\">\\n\\t<Tile>\\n\\t\\t<h3>Business - $50/mo</h3>\\n\\t\\t<ul class=\\"block\\">\\n\\t\\t\\t<li>Includes 10 domains</li>\\n\\t\\t\\t<li>Additional domains at $3 / domain per month</li>\\n\\t\\t\\t<li>Refunds and deleted domains will be prorated</li>\\n\\t\\t\\t<li>All charges are made annually</li>\\n\\t\\t</ul>\\n\\n\\t\\t{#if !isSubscribed($currentUser$?.data?.account?.type)}\\n\\t\\t\\t<form\\n\\t\\t\\t\\taction={\`\${BACKEND_HOST}/stripe/create-checkout-session/\${BUSINESS_STANDARD_PRICE_ID}\`}\\n\\t\\t\\t\\tmethod=\\"POST\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t<Button type=\\"submit\\" icon={CurrencyDollar32}>Checkout</Button>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t<img\\n\\t\\t\\t\\t\\t\\tclass=\\"stripe-logo\\"\\n\\t\\t\\t\\t\\t\\tsrc=\\"/images/3rd-party/powered-by-stripe.svg\\"\\n\\t\\t\\t\\t\\t\\talt=\\"Powered by Stripe\\"\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</form>\\n\\t\\t{:else}\\n\\t\\t\\t<div class=\\"block subscribed\\">\\n\\t\\t\\t\\t<CheckmarkFilled16 /> &nbsp; You're subscribed!\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\t</Tile>\\n</div>\\n\\n<style>\\n\\t.stripe-logo {\\n\\t\\theight: 3em;\\n\\t\\twidth: auto;\\n\\t}\\n\\n\\t.subscribed {\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4DC,YAAY,eAAC,CAAC,AACb,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,WAAW,eAAC,CAAC,AACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACpB,CAAC"}`
};
var Billing = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentUser$, $$unsubscribe_currentUser$;
  $$unsubscribe_currentUser$ = subscribe(currentUser$, (value) => $currentUser$ = value);
  $$result.css.add(css$8);
  $$unsubscribe_currentUser$();
  return `<h1>Billing</h1>

<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<h3>Free Trial</h3>
		<ul class="${"block"}"><li>Create 2 domains to try out AppMasker</li>
			<li>No Credit Card required</li></ul>`
  })}</div>
<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => {
      var _a, _b;
      return `<h3>Business - $50/mo</h3>
		<ul class="${"block"}"><li>Includes 10 domains</li>
			<li>Additional domains at $3 / domain per month</li>
			<li>Refunds and deleted domains will be prorated</li>
			<li>All charges are made annually</li></ul>

		${!isSubscribed((_b = (_a = $currentUser$ == null ? void 0 : $currentUser$.data) == null ? void 0 : _a.account) == null ? void 0 : _b.type) ? `<form${add_attribute("action", `${BACKEND_HOST}/stripe/create-checkout-session/${BUSINESS_STANDARD_PRICE_ID}`, 0)} method="${"POST"}"><div class="${"block"}">${validate_component(Button, "Button").$$render($$result, { type: "submit", icon: CurrencyDollar32 }, {}, { default: () => `Checkout` })}</div>
				<div class="${"block"}"><img class="${"stripe-logo svelte-18g0buj"}" src="${"/images/3rd-party/powered-by-stripe.svg"}" alt="${"Powered by Stripe"}"></div></form>` : `<div class="${"block subscribed svelte-18g0buj"}">${validate_component(CheckmarkFilled16, "CheckmarkFilled16").$$render($$result, {}, {}, {})} \xA0 You&#39;re subscribed!
			</div>`}`;
    }
  })}
</div>`;
});
var billing = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Billing
});
var CheckboxSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `
<div${spread([escape_object($$restProps)], "bx--form-item bx--checkbox-wrapper bx--checkbox-label")}><span${add_classes(["bx--checkbox-label-text bx--skeleton"].join(" ").trim())}></span></div>`;
});
var Checkbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "checked",
    "indeterminate",
    "skeleton",
    "readonly",
    "disabled",
    "labelText",
    "hideLabel",
    "name",
    "title",
    "id",
    "ref"
  ]);
  let { checked = false } = $$props;
  let { indeterminate = false } = $$props;
  let { skeleton = false } = $$props;
  let { readonly = false } = $$props;
  let { disabled = false } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { name = "" } = $$props;
  let { title = void 0 } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  const dispatch = createEventDispatcher();
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.indeterminate === void 0 && $$bindings.indeterminate && indeterminate !== void 0)
    $$bindings.indeterminate(indeterminate);
  if ($$props.skeleton === void 0 && $$bindings.skeleton && skeleton !== void 0)
    $$bindings.skeleton(skeleton);
  if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0)
    $$bindings.readonly(readonly);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  {
    dispatch("check", checked);
  }
  return `
${skeleton ? `${validate_component(CheckboxSkeleton, "CheckboxSkeleton").$$render($$result, Object.assign($$restProps), {}, {})}` : `<div${spread([escape_object($$restProps)], "bx--form-item bx--checkbox-wrapper")}><input type="${"checkbox"}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}${add_attribute("id", id, 0)}${add_attribute("indeterminate", indeterminate, 0)}${add_attribute("name", name, 0)} ${readonly ? "readonly" : ""}${add_classes(["bx--checkbox"].join(" ").trim())}${add_attribute("this", ref, 0)}>
    <label${add_attribute("for", id, 0)}${add_attribute("title", title, 0)}${add_classes(["bx--checkbox-label"].join(" ").trim())}><span${add_classes([
    "bx--checkbox-label-text " + (hideLabel ? "bx--visually-hidden" : "")
  ].join(" ").trim())}>${slots.labelText ? slots.labelText({}) : `
          ${escape2(labelText)}
        `}</span></label></div>`}`;
});
var ComposedModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "size",
    "open",
    "danger",
    "preventCloseOnClickOutside",
    "containerClass",
    "selectorPrimaryFocus",
    "ref"
  ]);
  let $label, $$unsubscribe_label;
  let { size = void 0 } = $$props;
  let { open = false } = $$props;
  let { danger = false } = $$props;
  let { preventCloseOnClickOutside = false } = $$props;
  let { containerClass = "" } = $$props;
  let { selectorPrimaryFocus = "[data-modal-primary-focus]" } = $$props;
  let { ref = null } = $$props;
  const dispatch = createEventDispatcher();
  const label = writable2(void 0);
  $$unsubscribe_label = subscribe(label, (value) => $label = value);
  let innerModal = null;
  setContext("ComposedModal", {
    closeModal: () => {
      open = false;
    },
    submit: () => {
      dispatch("submit");
      dispatch("click:button--primary");
    },
    declareRef: (ref2) => {
    },
    updateLabel: (value) => {
      label.set(value);
    }
  });
  onDestroy(() => {
    document.body.classList.remove("bx--body--with-modal-open");
  });
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.danger === void 0 && $$bindings.danger && danger !== void 0)
    $$bindings.danger(danger);
  if ($$props.preventCloseOnClickOutside === void 0 && $$bindings.preventCloseOnClickOutside && preventCloseOnClickOutside !== void 0)
    $$bindings.preventCloseOnClickOutside(preventCloseOnClickOutside);
  if ($$props.containerClass === void 0 && $$bindings.containerClass && containerClass !== void 0)
    $$bindings.containerClass(containerClass);
  if ($$props.selectorPrimaryFocus === void 0 && $$bindings.selectorPrimaryFocus && selectorPrimaryFocus !== void 0)
    $$bindings.selectorPrimaryFocus(selectorPrimaryFocus);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  $$unsubscribe_label();
  return `
<div${spread([{ role: "presentation" }, escape_object($$restProps)], "bx--modal " + (open ? "is-visible" : "") + " " + (danger ? "bx--modal--danger" : ""))}${add_attribute("this", ref, 0)}><div role="${"dialog"}" aria-modal="${"true"}"${add_attribute("aria-label", $$props["aria-label"] || $label || void 0, 0)} class="${[
    escape2(containerClass),
    "bx--modal-container " + (size === "xs" ? "bx--modal-container--xs" : "") + " " + (size === "sm" ? "bx--modal-container--sm" : "") + " " + (size === "lg" ? "bx--modal-container--lg" : "")
  ].join(" ").trim()}"${add_attribute("this", innerModal, 0)}>${slots.default ? slots.default({}) : ``}</div></div>`;
});
var ChevronRight16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ChevronRight16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var InlineCheckbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["checked", "indeterminate", "title", "id", "ref"]);
  let { checked = false } = $$props;
  let { indeterminate = false } = $$props;
  let { title = void 0 } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.indeterminate === void 0 && $$bindings.indeterminate && indeterminate !== void 0)
    $$bindings.indeterminate(indeterminate);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<input${spread([
    { type: "checkbox" },
    {
      checked: (indeterminate ? false : checked) || null
    },
    {
      indeterminate: escape_attribute_value(indeterminate)
    },
    { id: escape_attribute_value(id) },
    escape_object($$restProps),
    {
      "aria-label": escape_attribute_value(void 0)
    },
    {
      "aria-checked": escape_attribute_value(indeterminate ? "mixed" : checked)
    }
  ], "bx--checkbox")}${add_attribute("this", ref, 0)}>
<label${add_attribute("for", id, 0)}${add_attribute("title", title, 0)}${add_attribute("aria-label", $$props["aria-label"], 0)}${add_classes(["bx--checkbox-label"].join(" ").trim())}></label>`;
});
var RadioButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "value",
    "checked",
    "disabled",
    "labelPosition",
    "labelText",
    "hideLabel",
    "id",
    "name",
    "ref"
  ]);
  let $$slots = compute_slots(slots);
  let $selectedValue, $$unsubscribe_selectedValue;
  let { value = "" } = $$props;
  let { checked = false } = $$props;
  let { disabled = false } = $$props;
  let { labelPosition = "right" } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = "" } = $$props;
  let { ref = null } = $$props;
  const ctx = getContext("RadioButtonGroup");
  const selectedValue = ctx ? ctx.selectedValue : writable2(checked ? value : void 0);
  $$unsubscribe_selectedValue = subscribe(selectedValue, (value2) => $selectedValue = value2);
  if (ctx) {
    ctx.add({ id, checked, disabled, value });
  }
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.labelPosition === void 0 && $$bindings.labelPosition && labelPosition !== void 0)
    $$bindings.labelPosition(labelPosition);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  checked = $selectedValue === value;
  $$unsubscribe_selectedValue();
  return `<div${spread([escape_object($$restProps)], "bx--radio-button-wrapper " + (labelPosition === "left" ? "bx--radio-button-wrapper--label-left" : ""))}><input type="${"radio"}"${add_attribute("id", id, 0)}${add_attribute("name", name, 0)} ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}${add_attribute("value", value, 0)}${add_classes(["bx--radio-button"].join(" ").trim())}${add_attribute("this", ref, 0)}>
  <label${add_attribute("for", id, 0)}${add_classes(["bx--radio-button__label"].join(" ").trim())}><span${add_classes(["bx--radio-button__appearance"].join(" ").trim())}></span>
    ${labelText || $$slots.labelText ? `<span${add_classes([hideLabel ? "bx--visually-hidden" : ""].join(" ").trim())}>${slots.labelText ? slots.labelText({}) : `
          ${escape2(labelText)}
        `}</span>` : ``}</label></div>`;
});
var Table = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "zebra", "useStaticWidth", "shouldShowBorder", "sortable", "stickyHeader"]);
  let { size = void 0 } = $$props;
  let { zebra = false } = $$props;
  let { useStaticWidth = false } = $$props;
  let { shouldShowBorder = false } = $$props;
  let { sortable = false } = $$props;
  let { stickyHeader = false } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.zebra === void 0 && $$bindings.zebra && zebra !== void 0)
    $$bindings.zebra(zebra);
  if ($$props.useStaticWidth === void 0 && $$bindings.useStaticWidth && useStaticWidth !== void 0)
    $$bindings.useStaticWidth(useStaticWidth);
  if ($$props.shouldShowBorder === void 0 && $$bindings.shouldShowBorder && shouldShowBorder !== void 0)
    $$bindings.shouldShowBorder(shouldShowBorder);
  if ($$props.sortable === void 0 && $$bindings.sortable && sortable !== void 0)
    $$bindings.sortable(sortable);
  if ($$props.stickyHeader === void 0 && $$bindings.stickyHeader && stickyHeader !== void 0)
    $$bindings.stickyHeader(stickyHeader);
  return `${stickyHeader ? `<section${spread([escape_object($$restProps)], "bx--data-table_inner-container")}><table${add_classes([
    "bx--data-table " + (size === "compact" ? "bx--data-table--compact" : "") + " " + (size === "short" ? "bx--data-table--short" : "") + " " + (size === "tall" ? "bx--data-table--tall" : "") + " " + (size === "medium" ? "bx--data-table--md" : "") + " " + (sortable ? "bx--data-table--sort" : "") + " " + (zebra ? "bx--data-table--zebra" : "") + " " + (useStaticWidth ? "bx--data-table--static" : "") + " " + (!shouldShowBorder ? "bx--data-table--no-border" : "") + " " + (stickyHeader ? "bx--data-table--sticky-header" : "")
  ].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</table></section>` : `<table${spread([escape_object($$restProps)], "bx--data-table " + (size === "compact" ? "bx--data-table--compact" : "") + " " + (size === "short" ? "bx--data-table--short" : "") + " " + (size === "tall" ? "bx--data-table--tall" : "") + " " + (size === "medium" ? "bx--data-table--md" : "") + " " + (sortable ? "bx--data-table--sort" : "") + " " + (zebra ? "bx--data-table--zebra" : "") + " " + (useStaticWidth ? "bx--data-table--static" : "") + " " + (!shouldShowBorder ? "bx--data-table--no-border" : "") + " " + (stickyHeader ? "bx--data-table--sticky-header" : ""))}>${slots.default ? slots.default({}) : ``}</table>`}`;
});
var TableBody = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `<tbody${spread([{ "aria-live": "polite" }, escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</tbody>`;
});
var TableCell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `
<td${spread([escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</td>`;
});
var TableContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["title", "description", "stickyHeader", "useStaticWidth"]);
  let { title = "" } = $$props;
  let { description = "" } = $$props;
  let { stickyHeader = false } = $$props;
  let { useStaticWidth = false } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.stickyHeader === void 0 && $$bindings.stickyHeader && stickyHeader !== void 0)
    $$bindings.stickyHeader(stickyHeader);
  if ($$props.useStaticWidth === void 0 && $$bindings.useStaticWidth && useStaticWidth !== void 0)
    $$bindings.useStaticWidth(useStaticWidth);
  return `<div${spread([escape_object($$restProps)], "bx--data-table-container " + (useStaticWidth ? "bx--data-table-container--static" : "") + " " + (stickyHeader ? "bx--data-table--max-width" : ""))}>${title ? `<div${add_classes(["bx--data-table-header"].join(" ").trim())}><h4${add_classes(["bx--data-table-header__title"].join(" ").trim())}>${escape2(title)}</h4>
      <p${add_classes(["bx--data-table-header__description"].join(" ").trim())}>${escape2(description)}</p></div>` : ``}
  ${slots.default ? slots.default({}) : ``}</div>`;
});
var TableHead = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `
<thead${spread([escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</thead>`;
});
var ArrowUp20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ArrowUp20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M16 4L6 14 7.41 15.41 15 7.83 15 28 17 28 17 7.83 24.59 15.41 26 14 16 4z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var ArrowsVertical20 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ArrowsVertical20" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "20" },
    { height: "20" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M27.6 20.6L24 24.2 24 4 22 4 22 24.2 18.4 20.6 17 22 23 28 29 22zM9 4L3 10 4.4 11.4 8 7.8 8 28 10 28 10 7.8 13.6 11.4 15 10z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var TableHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let active;
  let ariaLabel;
  let $$restProps = compute_rest_props($$props, ["disableSorting", "scope", "translateWithId", "id"]);
  let $sortHeader, $$unsubscribe_sortHeader;
  let $tableSortable, $$unsubscribe_tableSortable;
  let { disableSorting = false } = $$props;
  let { scope = "col" } = $$props;
  let { translateWithId = () => "" } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  const { sortHeader, tableSortable, add } = getContext("DataTable");
  $$unsubscribe_sortHeader = subscribe(sortHeader, (value) => $sortHeader = value);
  $$unsubscribe_tableSortable = subscribe(tableSortable, (value) => $tableSortable = value);
  add(id);
  if ($$props.disableSorting === void 0 && $$bindings.disableSorting && disableSorting !== void 0)
    $$bindings.disableSorting(disableSorting);
  if ($$props.scope === void 0 && $$bindings.scope && scope !== void 0)
    $$bindings.scope(scope);
  if ($$props.translateWithId === void 0 && $$bindings.translateWithId && translateWithId !== void 0)
    $$bindings.translateWithId(translateWithId);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  active = $sortHeader.id === id;
  ariaLabel = translateWithId();
  $$unsubscribe_sortHeader();
  $$unsubscribe_tableSortable();
  return `
${$tableSortable && !disableSorting ? `<th${spread([
    {
      "aria-sort": escape_attribute_value(active ? $sortHeader.sortDirection : "none")
    },
    { scope: escape_attribute_value(scope) },
    { id: escape_attribute_value(id) },
    escape_object($$restProps)
  ])}><button${add_classes([
    "bx--table-sort " + (active ? "bx--table-sort--active" : "") + " " + (active && $sortHeader.sortDirection === "descending" ? "bx--table-sort--ascending" : "")
  ].join(" ").trim())}><div${add_classes(["bx--table-header-label"].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</div>
      ${validate_component(ArrowUp20, "ArrowUp20").$$render($$result, {
    "aria-label": ariaLabel,
    class: "bx--table-sort__icon"
  }, {}, {})}
      ${validate_component(ArrowsVertical20, "ArrowsVertical20").$$render($$result, {
    "aria-label": ariaLabel,
    class: "bx--table-sort__icon-unsorted"
  }, {}, {})}</button></th>` : `<th${spread([
    { scope: escape_attribute_value(scope) },
    { id: escape_attribute_value(id) },
    escape_object($$restProps)
  ])}><div${add_classes(["bx--table-header-label"].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</div></th>`}`;
});
var TableRow = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `
<tr${spread([escape_object($$restProps)])}>${slots.default ? slots.default({}) : ``}</tr>`;
});
var DataTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let expandedRows;
  let indeterminate;
  let headerKeys;
  let sortedRows;
  let ascending;
  let sortKey;
  let sorting;
  let $$restProps = compute_rest_props($$props, [
    "headers",
    "rows",
    "size",
    "title",
    "description",
    "zebra",
    "sortable",
    "expandable",
    "batchExpansion",
    "expandedRowIds",
    "radio",
    "selectable",
    "batchSelection",
    "selectedRowIds",
    "stickyHeader",
    "useStaticWidth"
  ]);
  let $$slots = compute_slots(slots);
  let $sortHeader, $$unsubscribe_sortHeader;
  let $headerItems, $$unsubscribe_headerItems;
  let $$unsubscribe_thKeys;
  let { headers = [] } = $$props;
  let { rows = [] } = $$props;
  let { size = void 0 } = $$props;
  let { title = "" } = $$props;
  let { description = "" } = $$props;
  let { zebra = false } = $$props;
  let { sortable = false } = $$props;
  let { expandable = false } = $$props;
  let { batchExpansion = false } = $$props;
  let { expandedRowIds = [] } = $$props;
  let { radio = false } = $$props;
  let { selectable = false } = $$props;
  let { batchSelection = false } = $$props;
  let { selectedRowIds = [] } = $$props;
  let { stickyHeader = false } = $$props;
  let { useStaticWidth = false } = $$props;
  createEventDispatcher();
  const batchSelectedIds = writable2(false);
  const tableSortable = writable2(sortable);
  const sortHeader = writable2({
    id: null,
    key: null,
    sort: void 0,
    sortDirection: "none"
  });
  $$unsubscribe_sortHeader = subscribe(sortHeader, (value) => $sortHeader = value);
  const headerItems = writable2([]);
  $$unsubscribe_headerItems = subscribe(headerItems, (value) => $headerItems = value);
  const thKeys = derived(headerItems, () => headers.map(({ key }, i) => ({ key, id: $headerItems[i] })).reduce((a, c) => ({ ...a, [c.key]: c.id }), {}));
  $$unsubscribe_thKeys = subscribe(thKeys, (value) => value);
  const resolvePath = (object, path) => path.split(/[\.\[\]\'\"]/).filter((p) => p).reduce((o, p) => o && typeof o === "object" ? o[p] : o, object);
  setContext("DataTable", {
    sortHeader,
    tableSortable,
    batchSelectedIds,
    resetSelectedRowIds: () => {
      selectAll = false;
      selectedRowIds = [];
      if (refSelectAll)
        refSelectAll.checked = false;
    },
    add: (id) => {
      headerItems.update((_) => [..._, id]);
    }
  });
  let parentRowId = null;
  let selectAll = false;
  let refSelectAll = null;
  if ($$props.headers === void 0 && $$bindings.headers && headers !== void 0)
    $$bindings.headers(headers);
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.zebra === void 0 && $$bindings.zebra && zebra !== void 0)
    $$bindings.zebra(zebra);
  if ($$props.sortable === void 0 && $$bindings.sortable && sortable !== void 0)
    $$bindings.sortable(sortable);
  if ($$props.expandable === void 0 && $$bindings.expandable && expandable !== void 0)
    $$bindings.expandable(expandable);
  if ($$props.batchExpansion === void 0 && $$bindings.batchExpansion && batchExpansion !== void 0)
    $$bindings.batchExpansion(batchExpansion);
  if ($$props.expandedRowIds === void 0 && $$bindings.expandedRowIds && expandedRowIds !== void 0)
    $$bindings.expandedRowIds(expandedRowIds);
  if ($$props.radio === void 0 && $$bindings.radio && radio !== void 0)
    $$bindings.radio(radio);
  if ($$props.selectable === void 0 && $$bindings.selectable && selectable !== void 0)
    $$bindings.selectable(selectable);
  if ($$props.batchSelection === void 0 && $$bindings.batchSelection && batchSelection !== void 0)
    $$bindings.batchSelection(batchSelection);
  if ($$props.selectedRowIds === void 0 && $$bindings.selectedRowIds && selectedRowIds !== void 0)
    $$bindings.selectedRowIds(selectedRowIds);
  if ($$props.stickyHeader === void 0 && $$bindings.stickyHeader && stickyHeader !== void 0)
    $$bindings.stickyHeader(stickyHeader);
  if ($$props.useStaticWidth === void 0 && $$bindings.useStaticWidth && useStaticWidth !== void 0)
    $$bindings.useStaticWidth(useStaticWidth);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    expandedRows = expandedRowIds.reduce((a, id) => ({ ...a, [id]: true }), {});
    {
      batchSelectedIds.set(selectedRowIds);
    }
    headerKeys = headers.map(({ key }) => key);
    rows = rows.map((row) => ({
      ...row,
      cells: headerKeys.map((key, index2) => ({
        key,
        value: resolvePath(row, key),
        display: headers[index2].display
      }))
    }));
    indeterminate = selectedRowIds.length > 0 && selectedRowIds.length < rows.length;
    {
      if (batchExpansion)
        expandable = true;
    }
    {
      if (radio || batchSelection)
        selectable = true;
    }
    {
      tableSortable.set(sortable);
    }
    sortedRows = rows;
    ascending = $sortHeader.sortDirection === "ascending";
    sortKey = $sortHeader.key;
    sorting = sortable && sortKey != null;
    {
      if (sorting) {
        if ($sortHeader.sortDirection === "none") {
          sortedRows = rows;
        } else {
          sortedRows = [...rows].sort((a, b) => {
            const itemA = ascending ? resolvePath(a, sortKey) : resolvePath(b, sortKey);
            const itemB = ascending ? resolvePath(b, sortKey) : resolvePath(a, sortKey);
            if ($sortHeader.sort)
              return $sortHeader.sort(itemA, itemB);
            if (typeof itemA === "number" && typeof itemB === "number")
              return itemA - itemB;
            return itemA.toString().localeCompare(itemB.toString(), "en", { numeric: true });
          });
        }
      }
    }
    $$rendered = `${validate_component(TableContainer, "TableContainer").$$render($$result, Object.assign({ useStaticWidth }, $$restProps), {}, {
      default: () => `${title || $$slots.title || description || $$slots.description ? `<div${add_classes(["bx--data-table-header"].join(" ").trim())}>${title || $$slots.title ? `<h4${add_classes(["bx--data-table-header__title"].join(" ").trim())}>${slots.title ? slots.title({}) : `${escape2(title)}`}</h4>` : ``}
      ${description || $$slots.description ? `<p${add_classes(["bx--data-table-header__description"].join(" ").trim())}>${slots.description ? slots.description({}) : `${escape2(description)}`}</p>` : ``}</div>` : ``}
  ${slots.default ? slots.default({}) : ``}
  ${validate_component(Table, "Table").$$render($$result, {
        zebra,
        size,
        stickyHeader,
        sortable,
        useStaticWidth
      }, {}, {
        default: () => `${validate_component(TableHead, "TableHead").$$render($$result, {}, {}, {
          default: () => `${validate_component(TableRow, "TableRow").$$render($$result, {}, {}, {
            default: () => `${expandable ? `<th scope="${"col"}"${add_attribute("data-previous-value", void 0, 0)}${add_classes(["bx--table-expand"].join(" ").trim())}>${batchExpansion ? `<button type="${"button"}"${add_classes(["bx--table-expand__button"].join(" ").trim())}>${validate_component(ChevronRight16, "ChevronRight16").$$render($$result, { class: "bx--table-expand__svg" }, {}, {})}</button>` : ``}</th>` : ``}
        ${selectable && !batchSelection ? `<th scope="${"col"}"></th>` : ``}
        ${batchSelection && !radio ? `<th scope="${"col"}"${add_classes(["bx--table-column-checkbox"].join(" ").trim())}>${validate_component(InlineCheckbox, "InlineCheckbox").$$render($$result, {
              "aria-label": "Select all rows",
              checked: selectAll,
              indeterminate,
              ref: refSelectAll
            }, {
              ref: ($$value) => {
                refSelectAll = $$value;
                $$settled = false;
              }
            }, {})}</th>` : ``}
        ${each(headers, (header, i) => `${header.empty ? `<th scope="${"col"}"></th>` : `${validate_component(TableHeader, "TableHeader").$$render($$result, { disableSorting: header.sort === false }, {}, {
              default: () => `${slots["cell-header"] ? slots["cell-header"]({ header }) : `${escape2(header.value)}`}
            `
            })}`}`)}`
          })}`
        })}
    ${validate_component(TableBody, "TableBody").$$render($$result, {}, {}, {
          default: () => `${each(sorting ? sortedRows : rows, (row, i) => `${validate_component(TableRow, "TableRow").$$render($$result, {
            id: "row-" + row.id,
            class: (selectedRowIds.includes(row.id) ? "bx--data-table--selected" : "") + " " + (expandedRows[row.id] ? "bx--expandable-row" : "") + " " + (expandable ? "bx--parent-row" : "") + " " + (expandable && parentRowId === row.id ? "bx--expandable-row--hover" : "")
          }, {}, {
            default: () => `${expandable ? `${validate_component(TableCell, "TableCell").$$render($$result, {
              class: "bx--table-expand",
              headers: "expand",
              "data-previous-value": expandedRows[row.id] ? "collapsed" : void 0
            }, {}, {
              default: () => `<button type="${"button"}"${add_attribute("aria-label", expandedRows[row.id] ? "Collapse current row" : "Expand current row", 0)}${add_classes(["bx--table-expand__button"].join(" ").trim())}>${validate_component(ChevronRight16, "ChevronRight16").$$render($$result, { class: "bx--table-expand__svg" }, {}, {})}</button>
            `
            })}` : ``}
          ${selectable ? `<td${add_classes([
              "bx--table-column-checkbox " + (radio ? "bx--table-column-radio" : "")
            ].join(" ").trim())}>${radio ? `${validate_component(RadioButton, "RadioButton").$$render($$result, {
              name: "select-row-" + row.id,
              checked: selectedRowIds.includes(row.id)
            }, {}, {})}` : `${validate_component(InlineCheckbox, "InlineCheckbox").$$render($$result, {
              name: "select-row-" + row.id,
              checked: selectedRowIds.includes(row.id)
            }, {}, {})}`}
            </td>` : ``}
          ${each(row.cells, (cell, j) => `${headers[j].empty ? `<td${add_classes([headers[j].columnMenu ? "bx--table-column-menu" : ""].join(" ").trim())}>${slots.cell ? slots.cell({ row, cell }) : `
                  ${escape2(cell.display ? cell.display(cell.value) : cell.value)}
                `}
              </td>` : `${validate_component(TableCell, "TableCell").$$render($$result, {}, {}, {
              default: () => `${slots.cell ? slots.cell({ row, cell }) : `
                  ${escape2(cell.display ? cell.display(cell.value) : cell.value)}
                `}
              `
            })}`}`)}
        `
          })}

        ${expandable && expandedRows[row.id] ? `<tr data-child-row${add_classes(["bx--expandable-row"].join(" ").trim())}>${validate_component(TableCell, "TableCell").$$render($$result, {
            colspan: selectable ? headers.length + 2 : headers.length + 1
          }, {}, {
            default: () => `<div${add_classes(["bx--child-row-inner-container"].join(" ").trim())}>${slots["expanded-row"] ? slots["expanded-row"]({ row }) : ``}</div>
            `
          })}
          </tr>` : ``}`)}`
        })}`
      })}`
    })}`;
  } while (!$$settled);
  $$unsubscribe_sortHeader();
  $$unsubscribe_headerItems();
  $$unsubscribe_thKeys();
  return $$rendered;
});
var DataTableSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let values;
  let cols;
  let $$restProps = compute_rest_props($$props, ["columns", "rows", "size", "zebra", "showHeader", "headers", "showToolbar"]);
  let { columns = 5 } = $$props;
  let { rows = 5 } = $$props;
  let { size = void 0 } = $$props;
  let { zebra = false } = $$props;
  let { showHeader = true } = $$props;
  let { headers = [] } = $$props;
  let { showToolbar = true } = $$props;
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0)
    $$bindings.columns(columns);
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.zebra === void 0 && $$bindings.zebra && zebra !== void 0)
    $$bindings.zebra(zebra);
  if ($$props.showHeader === void 0 && $$bindings.showHeader && showHeader !== void 0)
    $$bindings.showHeader(showHeader);
  if ($$props.headers === void 0 && $$bindings.headers && headers !== void 0)
    $$bindings.headers(headers);
  if ($$props.showToolbar === void 0 && $$bindings.showToolbar && showToolbar !== void 0)
    $$bindings.showToolbar(showToolbar);
  values = headers.map((header) => header.value !== void 0 ? header.value : header);
  cols = Array.from({
    length: headers.length > 0 ? headers.length : columns
  }, (_, i) => i);
  return `
<div${spread([escape_object($$restProps)], "bx--skeleton bx--data-table-container")}>${showHeader ? `<div${add_classes(["bx--data-table-header"].join(" ").trim())}><div${add_classes(["bx--data-table-header__title"].join(" ").trim())}></div>
      <div${add_classes(["bx--data-table-header__description"].join(" ").trim())}></div></div>` : ``}
  ${showToolbar ? `<section aria-label="${"data table toolbar"}"${add_classes(["bx--table-toolbar"].join(" ").trim())}><div${add_classes(["bx--toolbar-content"].join(" ").trim())}><span${add_classes([
    "bx--skeleton bx--btn bx--btn--sm"
  ].join(" ").trim())}></span></div></section>` : ``}
  <table${add_classes([
    "bx--skeleton bx--data-table " + (size === "compact" ? "bx--data-table--compact" : "") + " " + (size === "short" ? "bx--data-table--short" : "") + " " + (size === "tall" ? "bx--data-table--tall" : "") + " " + (zebra ? "bx--data-table--zebra" : "")
  ].join(" ").trim())}><thead><tr>${each(cols, (col) => `${typeof values[col] === "object" && values[col].empty === true ? `<th></th>` : `<th>${escape2(values[col] || "")}</th>`}`)}</tr></thead>
    <tbody>${each(Array.from({ length: rows }, (_, i) => i), (row) => `<tr>${each(cols, (col) => `<td><span></span></td>`)}
        </tr>`)}</tbody></table></div>`;
});
var ErrorFilled16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ErrorFilled16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"}"></path><path fill="${"none"}" d="${"M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var Loading = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let spinnerRadius;
  let $$restProps = compute_rest_props($$props, ["small", "active", "withOverlay", "description", "id"]);
  let { small = false } = $$props;
  let { active = true } = $$props;
  let { withOverlay = true } = $$props;
  let { description = "Active loading indicator" } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  if ($$props.small === void 0 && $$bindings.small && small !== void 0)
    $$bindings.small(small);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.withOverlay === void 0 && $$bindings.withOverlay && withOverlay !== void 0)
    $$bindings.withOverlay(withOverlay);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  spinnerRadius = small ? "42" : "44";
  return `${withOverlay ? `<div${spread([escape_object($$restProps)], "bx--loading-overlay " + (!active ? "bx--loading-overlay--stop" : ""))}><div aria-atomic="${"true"}"${add_attribute("aria-labelledby", id, 0)}${add_attribute("aria-live", active ? "assertive" : "off", 0)}${add_classes([
    "bx--loading " + (small ? "bx--loading--small" : "") + " " + (!active ? "bx--loading--stop" : "")
  ].join(" ").trim())}>
      <label${add_attribute("id", id, 0)}${add_classes(["bx--visually-hidden"].join(" ").trim())}>${escape2(description)}</label>
      <svg viewBox="${"0 0 100 100"}"${add_classes(["bx--loading__svg"].join(" ").trim())}><title>${escape2(description)}</title>${small ? `<circle cx="${"50%"}" cy="${"50%"}"${add_attribute("r", spinnerRadius, 0)}${add_classes(["bx--loading__background"].join(" ").trim())}></circle>` : ``}<circle cx="${"50%"}" cy="${"50%"}"${add_attribute("r", spinnerRadius, 0)}${add_classes(["bx--loading__stroke"].join(" ").trim())}></circle></svg></div></div>` : `<div${spread([
    { "aria-atomic": "true" },
    {
      "aria-labelledby": escape_attribute_value(id)
    },
    {
      "aria-live": escape_attribute_value(active ? "assertive" : "off")
    },
    escape_object($$restProps)
  ], "bx--loading " + (small ? "bx--loading--small" : "") + " " + (!active ? "bx--loading--stop" : ""))}>
    <label${add_attribute("id", id, 0)}${add_classes(["bx--visually-hidden"].join(" ").trim())}>${escape2(description)}</label>
    <svg viewBox="${"0 0 100 100"}"${add_classes(["bx--loading__svg"].join(" ").trim())}><title>${escape2(description)}</title>${small ? `<circle cx="${"50%"}" cy="${"50%"}"${add_attribute("r", spinnerRadius, 0)}${add_classes(["bx--loading__background"].join(" ").trim())}></circle>` : ``}<circle cx="${"50%"}" cy="${"50%"}"${add_attribute("r", spinnerRadius, 0)}${add_classes(["bx--loading__stroke"].join(" ").trim())}></circle></svg></div>`}`;
});
var InlineLoading = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["status", "description", "iconDescription", "successDelay"]);
  let { status = "active" } = $$props;
  let { description = void 0 } = $$props;
  let { iconDescription = void 0 } = $$props;
  let { successDelay = 1500 } = $$props;
  createEventDispatcher();
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  if ($$props.successDelay === void 0 && $$bindings.successDelay && successDelay !== void 0)
    $$bindings.successDelay(successDelay);
  return `
<div${spread([{ "aria-live": "assertive" }, escape_object($$restProps)], "bx--inline-loading")}><div${add_classes(["bx--inline-loading__animation"].join(" ").trim())}>${status === "error" ? `${validate_component(ErrorFilled16, "ErrorFilled16").$$render($$result, {
    class: "bx--inline-loading--error",
    title: iconDescription
  }, {}, {})}` : `${status === "finished" ? `${validate_component(CheckmarkFilled16, "CheckmarkFilled16").$$render($$result, {
    class: "bx--inline-loading__checkmark-container",
    title: iconDescription
  }, {}, {})}` : `${status === "inactive" || status === "active" ? `${validate_component(Loading, "Loading").$$render($$result, {
    small: true,
    description: iconDescription,
    withOverlay: false,
    active: status === "active"
  }, {}, {})}` : ``}`}`}</div>
  ${description ? `<div${add_classes(["bx--inline-loading__text"].join(" ").trim())}>${escape2(description)}</div>` : ``}</div>`;
});
var Link = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size", "href", "inline", "icon", "disabled", "visited", "ref"]);
  let { size = void 0 } = $$props;
  let { href = void 0 } = $$props;
  let { inline = false } = $$props;
  let { icon = void 0 } = $$props;
  let { disabled = false } = $$props;
  let { visited = false } = $$props;
  let { ref = null } = $$props;
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.visited === void 0 && $$bindings.visited && visited !== void 0)
    $$bindings.visited(visited);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `
${disabled ? `<p${spread([escape_object($$restProps)], "bx--link " + (disabled ? "bx--link--disabled" : "") + " " + (inline ? "bx--link--inline" : "") + " " + (visited ? "bx--link--visited" : ""))}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : ``}${!inline && icon ? `<div${add_classes(["bx--link__icon"].join(" ").trim())}>${validate_component(icon || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</div>` : ``}</p>` : `<a${spread([
    {
      rel: escape_attribute_value($$restProps.target === "_blank" ? "noopener noreferrer" : void 0)
    },
    { href: escape_attribute_value(href) },
    escape_object($$restProps)
  ], "bx--link " + (disabled ? "bx--link--disabled" : "") + " " + (inline ? "bx--link--inline" : "") + " " + (visited ? "bx--link--visited" : "") + " " + (size === "sm" ? "bx--link--sm" : "") + " " + (size === "lg" ? "bx--link--lg" : ""))}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : ``}${!inline && icon ? `<div${add_classes(["bx--link__icon"].join(" ").trim())}>${validate_component(icon || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</div>` : ``}</a>`}`;
});
var ModalBody = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["hasForm", "hasScrollingContent"]);
  let { hasForm = false } = $$props;
  let { hasScrollingContent = false } = $$props;
  if ($$props.hasForm === void 0 && $$bindings.hasForm && hasForm !== void 0)
    $$bindings.hasForm(hasForm);
  if ($$props.hasScrollingContent === void 0 && $$bindings.hasScrollingContent && hasScrollingContent !== void 0)
    $$bindings.hasScrollingContent(hasScrollingContent);
  return `<div${spread([
    {
      tabindex: escape_attribute_value(hasScrollingContent ? "0" : void 0)
    },
    {
      role: escape_attribute_value(hasScrollingContent ? "region" : void 0)
    },
    escape_object($$restProps)
  ], "bx--modal-content " + (hasForm ? "bx--modal-content--with-form" : "") + " " + (hasScrollingContent ? "bx--modal-scroll-content" : ""))}>${slots.default ? slots.default({}) : ``}</div>
${hasScrollingContent ? `<div${add_classes(["bx--modal-content--overflow-indicator"].join(" ").trim())}></div>` : ``}`;
});
var ModalFooter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "primaryButtonText",
    "primaryButtonDisabled",
    "primaryClass",
    "secondaryButtonText",
    "secondaryButtons",
    "secondaryClass",
    "danger"
  ]);
  let { primaryButtonText = "" } = $$props;
  let { primaryButtonDisabled = false } = $$props;
  let { primaryClass = void 0 } = $$props;
  let { secondaryButtonText = "" } = $$props;
  let { secondaryButtons = [] } = $$props;
  let { secondaryClass = void 0 } = $$props;
  let { danger = false } = $$props;
  createEventDispatcher();
  getContext("ComposedModal");
  if ($$props.primaryButtonText === void 0 && $$bindings.primaryButtonText && primaryButtonText !== void 0)
    $$bindings.primaryButtonText(primaryButtonText);
  if ($$props.primaryButtonDisabled === void 0 && $$bindings.primaryButtonDisabled && primaryButtonDisabled !== void 0)
    $$bindings.primaryButtonDisabled(primaryButtonDisabled);
  if ($$props.primaryClass === void 0 && $$bindings.primaryClass && primaryClass !== void 0)
    $$bindings.primaryClass(primaryClass);
  if ($$props.secondaryButtonText === void 0 && $$bindings.secondaryButtonText && secondaryButtonText !== void 0)
    $$bindings.secondaryButtonText(secondaryButtonText);
  if ($$props.secondaryButtons === void 0 && $$bindings.secondaryButtons && secondaryButtons !== void 0)
    $$bindings.secondaryButtons(secondaryButtons);
  if ($$props.secondaryClass === void 0 && $$bindings.secondaryClass && secondaryClass !== void 0)
    $$bindings.secondaryClass(secondaryClass);
  if ($$props.danger === void 0 && $$bindings.danger && danger !== void 0)
    $$bindings.danger(danger);
  return `<div${spread([escape_object($$restProps)], "bx--modal-footer " + (secondaryButtons.length === 2 ? "bx--modal-footer--three-button" : ""))}>${secondaryButtons.length > 0 ? `${each(secondaryButtons, (button) => `${validate_component(Button, "Button").$$render($$result, { kind: "secondary" }, {}, {
    default: () => `${escape2(button.text)}
      `
  })}`)}` : `${secondaryButtonText ? `${validate_component(Button, "Button").$$render($$result, { kind: "secondary", class: secondaryClass }, {}, {
    default: () => `${escape2(secondaryButtonText)}`
  })}` : ``}`}
  ${primaryButtonText ? `${validate_component(Button, "Button").$$render($$result, {
    kind: danger ? "danger" : "primary",
    disabled: primaryButtonDisabled,
    class: primaryClass
  }, {}, {
    default: () => `${escape2(primaryButtonText)}`
  })}` : ``}
  ${slots.default ? slots.default({}) : ``}</div>`;
});
var ModalHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "title",
    "label",
    "labelClass",
    "titleClass",
    "closeClass",
    "closeIconClass",
    "iconDescription"
  ]);
  let { title = "" } = $$props;
  let { label = "" } = $$props;
  let { labelClass = "" } = $$props;
  let { titleClass = "" } = $$props;
  let { closeClass = "" } = $$props;
  let { closeIconClass = "" } = $$props;
  let { iconDescription = "Close" } = $$props;
  const { closeModal, updateLabel } = getContext("ComposedModal");
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.labelClass === void 0 && $$bindings.labelClass && labelClass !== void 0)
    $$bindings.labelClass(labelClass);
  if ($$props.titleClass === void 0 && $$bindings.titleClass && titleClass !== void 0)
    $$bindings.titleClass(titleClass);
  if ($$props.closeClass === void 0 && $$bindings.closeClass && closeClass !== void 0)
    $$bindings.closeClass(closeClass);
  if ($$props.closeIconClass === void 0 && $$bindings.closeIconClass && closeIconClass !== void 0)
    $$bindings.closeIconClass(closeIconClass);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  {
    updateLabel(label);
  }
  return `<div${spread([escape_object($$restProps)], "bx--modal-header")}>${label ? `<h2 class="${[
    escape2(labelClass),
    "bx--modal-header__label bx--type-delta"
  ].join(" ").trim()}">${escape2(label)}</h2>` : ``}
  ${title ? `<h3 class="${[
    escape2(titleClass),
    "bx--modal-header__heading bx--type-beta"
  ].join(" ").trim()}">${escape2(title)}</h3>` : ``}
  ${slots.default ? slots.default({}) : ``}
  <button type="${"button"}"${add_attribute("title", iconDescription, 0)}${add_attribute("aria-label", iconDescription, 0)} class="${[escape2(closeClass), "bx--modal-close"].join(" ").trim()}">${validate_component(Close20, "Close20").$$render($$result, {
    class: "bx--modal-close__icon " + closeIconClass
  }, {}, {})}</button></div>`;
});
var Toolbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["size"]);
  let { size = "default" } = $$props;
  let ref = null;
  const overflowVisible = writable2(false);
  setContext("Toolbar", {
    overflowVisible,
    setOverflowVisible: (visible) => {
      overflowVisible.set(visible);
    }
  });
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  return `<section${spread([{ "aria-label": "data table toolbar" }, escape_object($$restProps)], "bx--table-toolbar " + (size === "sm" ? "bx--table-toolbar--small" : "") + " " + (size === "default" ? "bx--table-toolbar--normal" : ""))}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : ``}</section>`;
});
var ToolbarBatchActions = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showActions;
  let $$restProps = compute_rest_props($$props, ["formatTotalSelected"]);
  let { formatTotalSelected = (totalSelected) => `${totalSelected} item${totalSelected === 1 ? "" : "s"} selected` } = $$props;
  let batchSelectedIds = [];
  const ctx = getContext("DataTable");
  ctx.batchSelectedIds.subscribe((value) => {
    batchSelectedIds = value;
  });
  let overflowVisible = false;
  const ctxToolbar = getContext("Toolbar");
  ctxToolbar.overflowVisible.subscribe((value) => {
    overflowVisible = value;
  });
  if ($$props.formatTotalSelected === void 0 && $$bindings.formatTotalSelected && formatTotalSelected !== void 0)
    $$bindings.formatTotalSelected(formatTotalSelected);
  showActions = batchSelectedIds.length > 0;
  return `${!overflowVisible ? `<div${spread([escape_object($$restProps)], "bx--batch-actions " + (showActions ? "bx--batch-actions--active" : ""))}><div${add_classes(["bx--batch-summary"].join(" ").trim())}><p${add_classes(["bx--batch-summary__para"].join(" ").trim())}><span>${escape2(formatTotalSelected(batchSelectedIds.length))}</span></p></div>
    <div${add_classes(["bx--action-list"].join(" ").trim())}>${slots.default ? slots.default({}) : ``}
      ${validate_component(Button, "Button").$$render($$result, {
    class: "bx--batch-summary__cancel",
    tabindex: showActions ? "0" : "-1"
  }, {}, {
    default: () => `${slots.cancel ? slots.cancel({}) : `Cancel`}`
  })}</div></div>` : ``}`;
});
var ToolbarContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div${add_classes(["bx--toolbar-content"].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</div>`;
});
var Delete16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "Delete16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M12 12H14V24H12zM18 12H20V24H18z"}"></path><path d="${"M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var Edit16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "Edit16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M2 26H30V28H2zM25.4 9c.8-.8.8-2 0-2.8 0 0 0 0 0 0l-3.6-3.6c-.8-.8-2-.8-2.8 0 0 0 0 0 0 0l-15 15V24h6.4L25.4 9zM20.4 4L24 7.6l-3 3L17.4 7 20.4 4zM6 22v-3.6l10-10 3.6 3.6-10 10H6z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let modalLabelId;
  let modalHeadingId;
  let modalBodyId;
  let ariaLabel;
  let $$restProps = compute_rest_props($$props, [
    "size",
    "open",
    "danger",
    "alert",
    "passiveModal",
    "modalHeading",
    "modalLabel",
    "modalAriaLabel",
    "iconDescription",
    "hasForm",
    "hasScrollingContent",
    "primaryButtonText",
    "primaryButtonDisabled",
    "shouldSubmitOnEnter",
    "secondaryButtonText",
    "secondaryButtons",
    "selectorPrimaryFocus",
    "preventCloseOnClickOutside",
    "id",
    "ref"
  ]);
  let { size = void 0 } = $$props;
  let { open = false } = $$props;
  let { danger = false } = $$props;
  let { alert = false } = $$props;
  let { passiveModal = false } = $$props;
  let { modalHeading = void 0 } = $$props;
  let { modalLabel = void 0 } = $$props;
  let { modalAriaLabel = void 0 } = $$props;
  let { iconDescription = "Close the modal" } = $$props;
  let { hasForm = false } = $$props;
  let { hasScrollingContent = false } = $$props;
  let { primaryButtonText = "" } = $$props;
  let { primaryButtonDisabled = false } = $$props;
  let { shouldSubmitOnEnter = true } = $$props;
  let { secondaryButtonText = "" } = $$props;
  let { secondaryButtons = [] } = $$props;
  let { selectorPrimaryFocus = "[data-modal-primary-focus]" } = $$props;
  let { preventCloseOnClickOutside = false } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  createEventDispatcher();
  let buttonRef = null;
  let innerModal = null;
  let alertDialogProps = {};
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.danger === void 0 && $$bindings.danger && danger !== void 0)
    $$bindings.danger(danger);
  if ($$props.alert === void 0 && $$bindings.alert && alert !== void 0)
    $$bindings.alert(alert);
  if ($$props.passiveModal === void 0 && $$bindings.passiveModal && passiveModal !== void 0)
    $$bindings.passiveModal(passiveModal);
  if ($$props.modalHeading === void 0 && $$bindings.modalHeading && modalHeading !== void 0)
    $$bindings.modalHeading(modalHeading);
  if ($$props.modalLabel === void 0 && $$bindings.modalLabel && modalLabel !== void 0)
    $$bindings.modalLabel(modalLabel);
  if ($$props.modalAriaLabel === void 0 && $$bindings.modalAriaLabel && modalAriaLabel !== void 0)
    $$bindings.modalAriaLabel(modalAriaLabel);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  if ($$props.hasForm === void 0 && $$bindings.hasForm && hasForm !== void 0)
    $$bindings.hasForm(hasForm);
  if ($$props.hasScrollingContent === void 0 && $$bindings.hasScrollingContent && hasScrollingContent !== void 0)
    $$bindings.hasScrollingContent(hasScrollingContent);
  if ($$props.primaryButtonText === void 0 && $$bindings.primaryButtonText && primaryButtonText !== void 0)
    $$bindings.primaryButtonText(primaryButtonText);
  if ($$props.primaryButtonDisabled === void 0 && $$bindings.primaryButtonDisabled && primaryButtonDisabled !== void 0)
    $$bindings.primaryButtonDisabled(primaryButtonDisabled);
  if ($$props.shouldSubmitOnEnter === void 0 && $$bindings.shouldSubmitOnEnter && shouldSubmitOnEnter !== void 0)
    $$bindings.shouldSubmitOnEnter(shouldSubmitOnEnter);
  if ($$props.secondaryButtonText === void 0 && $$bindings.secondaryButtonText && secondaryButtonText !== void 0)
    $$bindings.secondaryButtonText(secondaryButtonText);
  if ($$props.secondaryButtons === void 0 && $$bindings.secondaryButtons && secondaryButtons !== void 0)
    $$bindings.secondaryButtons(secondaryButtons);
  if ($$props.selectorPrimaryFocus === void 0 && $$bindings.selectorPrimaryFocus && selectorPrimaryFocus !== void 0)
    $$bindings.selectorPrimaryFocus(selectorPrimaryFocus);
  if ($$props.preventCloseOnClickOutside === void 0 && $$bindings.preventCloseOnClickOutside && preventCloseOnClickOutside !== void 0)
    $$bindings.preventCloseOnClickOutside(preventCloseOnClickOutside);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  modalLabelId = `bx--modal-header__label--modal-${id}`;
  modalHeadingId = `bx--modal-header__heading--modal-${id}`;
  modalBodyId = `bx--modal-body--${id}`;
  ariaLabel = modalLabel || $$props["aria-label"] || modalAriaLabel || modalHeading;
  {
    if (alert) {
      if (passiveModal) {
        alertDialogProps.role = "alert";
      }
      if (!passiveModal) {
        alertDialogProps.role = "alertdialog";
        alertDialogProps["aria-describedby"] = modalBodyId;
      }
    }
  }
  return `
<div${spread([
    { role: "presentation" },
    { id: escape_attribute_value(id) },
    escape_object($$restProps)
  ], "bx--modal " + (!passiveModal ? "bx--modal-tall" : "") + " " + (open ? "is-visible" : "") + " " + (danger ? "bx--modal--danger" : ""))}${add_attribute("this", ref, 0)}><div${spread([
    { role: "dialog" },
    { tabindex: "-1" },
    escape_object(alertDialogProps),
    { "aria-modal": "true" },
    {
      "aria-label": escape_attribute_value(ariaLabel)
    }
  ], "bx--modal-container " + (size === "xs" ? "bx--modal-container--xs" : "") + " " + (size === "sm" ? "bx--modal-container--sm" : "") + " " + (size === "lg" ? "bx--modal-container--lg" : ""))}${add_attribute("this", innerModal, 0)}><div${add_classes(["bx--modal-header"].join(" ").trim())}>${passiveModal ? `<button type="${"button"}"${add_attribute("aria-label", iconDescription, 0)}${add_attribute("title", iconDescription, 0)}${add_classes(["bx--modal-close"].join(" ").trim())}${add_attribute("this", buttonRef, 0)}>${validate_component(Close20, "Close20").$$render($$result, {
    "aria-label": iconDescription,
    class: "bx--modal-close__icon"
  }, {}, {})}</button>` : ``}
      ${modalLabel ? `<h2${add_attribute("id", modalLabelId, 0)}${add_classes(["bx--modal-header__label"].join(" ").trim())}>${slots.label ? slots.label({}) : `${escape2(modalLabel)}`}</h2>` : ``}
      <h3${add_attribute("id", modalHeadingId, 0)}${add_classes(["bx--modal-header__heading"].join(" ").trim())}>${slots.heading ? slots.heading({}) : `${escape2(modalHeading)}`}</h3>
      ${!passiveModal ? `<button type="${"button"}"${add_attribute("aria-label", iconDescription, 0)}${add_attribute("title", iconDescription, 0)}${add_classes(["bx--modal-close"].join(" ").trim())}${add_attribute("this", buttonRef, 0)}>${validate_component(Close20, "Close20").$$render($$result, {
    "aria-label": iconDescription,
    class: "bx--modal-close__icon"
  }, {}, {})}</button>` : ``}</div>
    <div${add_attribute("id", modalBodyId, 0)}${add_attribute("tabindex", hasScrollingContent ? "0" : void 0, 0)}${add_attribute("role", hasScrollingContent ? "region" : void 0, 0)}${add_attribute("aria-label", hasScrollingContent ? ariaLabel : void 0, 0)}${add_attribute("aria-labelledby", modalLabel ? modalLabelId : modalHeadingId, 0)}${add_classes([
    "bx--modal-content " + (hasForm ? "bx--modal-content--with-form" : "") + " " + (hasScrollingContent ? "bx--modal-scroll-content" : "")
  ].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</div>
    ${hasScrollingContent ? `<div${add_classes(["bx--modal-content--overflow-indicator"].join(" ").trim())}></div>` : ``}
    ${!passiveModal ? `<div${add_classes([
    "bx--modal-footer " + (secondaryButtons.length === 2 ? "bx--modal-footer--three-button" : "")
  ].join(" ").trim())}>${secondaryButtons.length > 0 ? `${each(secondaryButtons, (button) => `${validate_component(Button, "Button").$$render($$result, { kind: "secondary" }, {}, {
    default: () => `${escape2(button.text)}
            `
  })}`)}` : `${secondaryButtonText ? `${validate_component(Button, "Button").$$render($$result, { kind: "secondary" }, {}, {
    default: () => `${escape2(secondaryButtonText)}`
  })}` : ``}`}
        ${validate_component(Button, "Button").$$render($$result, {
    kind: danger ? "danger" : "primary",
    disabled: primaryButtonDisabled
  }, {}, {
    default: () => `${escape2(primaryButtonText)}`
  })}</div>` : ``}</div></div>`;
});
var WarningFilled16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "WarningFilled16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M8,1C4.2,1,1,4.2,1,8s3.2,7,7,7s7-3.1,7-7S11.9,1,8,1z M7.5,4h1v5h-1C7.5,9,7.5,4,7.5,4z M8,12.2	c-0.4,0-0.8-0.4-0.8-0.8s0.3-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,12.2,8,12.2z"}"></path><path d="${"M7.5,4h1v5h-1C7.5,9,7.5,4,7.5,4z M8,12.2c-0.4,0-0.8-0.4-0.8-0.8s0.3-0.8,0.8-0.8	c0.4,0,0.8,0.4,0.8,0.8S8.4,12.2,8,12.2z"}" data-icon-path="${"inner-path"}" opacity="${"0"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var TextArea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let errorId;
  let $$restProps = compute_rest_props($$props, [
    "value",
    "placeholder",
    "cols",
    "rows",
    "light",
    "disabled",
    "helperText",
    "labelText",
    "hideLabel",
    "invalid",
    "invalidText",
    "id",
    "name",
    "ref"
  ]);
  let { value = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { cols = 50 } = $$props;
  let { rows = 4 } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { helperText = "" } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { invalid = false } = $$props;
  let { invalidText = "" } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = void 0 } = $$props;
  let { ref = null } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.cols === void 0 && $$bindings.cols && cols !== void 0)
    $$bindings.cols(cols);
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.helperText === void 0 && $$bindings.helperText && helperText !== void 0)
    $$bindings.helperText(helperText);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.invalidText === void 0 && $$bindings.invalidText && invalidText !== void 0)
    $$bindings.invalidText(invalidText);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  errorId = `error-${id}`;
  return `
<div${add_classes(["bx--form-item"].join(" ").trim())}>${labelText && !hideLabel ? `<label${add_attribute("for", id, 0)}${add_classes([
    "bx--label " + (hideLabel ? "bx--visually-hidden" : "") + " " + (disabled ? "bx--label--disabled" : "")
  ].join(" ").trim())}>${slots.labelText ? slots.labelText({}) : `
        ${escape2(labelText)}
      `}</label>` : ``}
  <div${add_attribute("data-invalid", invalid || void 0, 0)}${add_classes(["bx--text-area__wrapper"].join(" ").trim())}>${invalid ? `${validate_component(WarningFilled16, "WarningFilled16").$$render($$result, { class: "bx--text-area__invalid-icon" }, {}, {})}` : ``}
    <textarea${spread([
    {
      "aria-invalid": escape_attribute_value(invalid || void 0)
    },
    {
      "aria-describedby": escape_attribute_value(invalid ? errorId : void 0)
    },
    { disabled: disabled || null },
    { id: escape_attribute_value(id) },
    { name: escape_attribute_value(name) },
    { cols: escape_attribute_value(cols) },
    { rows: escape_attribute_value(rows) },
    {
      placeholder: escape_attribute_value(placeholder)
    },
    escape_object($$restProps),
    {
      readonly: ($$restProps.readonly === true ? true : void 0) || null
    }
  ], "bx--text-area " + (light ? "bx--text-area--light" : "") + " " + (invalid ? "bx--text-area--invalid" : ""))}${add_attribute("this", ref, 0)}>${escape2(value)}</textarea></div>
  ${!invalid && helperText ? `<div${add_classes([
    "bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "")
  ].join(" ").trim())}>${escape2(helperText)}</div>` : ``}
  ${invalid ? `<div${add_attribute("id", errorId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(invalidText)}</div>` : ``}</div>`;
});
var jsonPlaceholder = JSON.stringify({ customerName: "Example Biz", accountTier: "pro" }, null, 2);
var ConfigDialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { data } = $$props;
  let modalIsOpen = false;
  let selectedDomainConfig = "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Link, "Link").$$render($$result, { style: "cursor:pointer" }, {}, { default: () => `View` })}

${validate_component(Modal, "Modal").$$render($$result, {
      modalHeading: "Config for " + data.name,
      passiveModal: true,
      open: modalIsOpen
    }, {
      open: ($$value) => {
        modalIsOpen = $$value;
        $$settled = false;
      }
    }, {
      default: () => `${validate_component(TextArea, "TextArea").$$render($$result, {
        labelText: "Data that relates to your tenant that owns this domain. Edit this by selecting the row from the table and clicking 'Edit'.",
        placeholder: jsonPlaceholder,
        readonly: true,
        rows: 15,
        value: selectedDomainConfig
      }, {
        value: ($$value) => {
          selectedDomainConfig = $$value;
          $$settled = false;
        }
      }, {})}`
    })}`;
  } while (!$$settled);
  return $$rendered;
});
var Form = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, []);
  return `
<form${spread([escape_object($$restProps)], "bx--form")}>${slots.default ? slots.default({}) : ``}</form>`;
});
var WarningAltFilled16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "WarningAltFilled16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path fill="${"none"}" d="${"M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z"}" data-icon-path="${"inner-path"}"></path><path d="${"M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"}"></path><path d="${"M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var EditOff16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "EditOff16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M30 28.6L3.4 2 2 3.4l10.1 10.1L4 21.6V28h6.4l8.1-8.1L28.6 30 30 28.6zM9.6 26H6v-3.6l7.5-7.5 3.6 3.6L9.6 26zM29.4 6.2L29.4 6.2l-3.6-3.6c-.8-.8-2-.8-2.8 0l0 0 0 0-8 8 1.4 1.4L20 8.4l3.6 3.6L20 15.6l1.4 1.4 8-8C30.2 8.2 30.2 7 29.4 6.2L29.4 6.2zM25 10.6L21.4 7l3-3L28 7.6 25 10.6z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var TextInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isFluid;
  let errorId;
  let warnId;
  let $$restProps = compute_rest_props($$props, [
    "size",
    "value",
    "type",
    "placeholder",
    "light",
    "disabled",
    "helperText",
    "id",
    "name",
    "labelText",
    "hideLabel",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "ref",
    "required",
    "inline",
    "readonly"
  ]);
  let { size = void 0 } = $$props;
  let { value = "" } = $$props;
  let { type = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { helperText = "" } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = void 0 } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { invalid = false } = $$props;
  let { invalidText = "" } = $$props;
  let { warn = false } = $$props;
  let { warnText = "" } = $$props;
  let { ref = null } = $$props;
  let { required = false } = $$props;
  let { inline = false } = $$props;
  let { readonly = false } = $$props;
  const ctx = getContext("Form");
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.helperText === void 0 && $$bindings.helperText && helperText !== void 0)
    $$bindings.helperText(helperText);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.invalidText === void 0 && $$bindings.invalidText && invalidText !== void 0)
    $$bindings.invalidText(invalidText);
  if ($$props.warn === void 0 && $$bindings.warn && warn !== void 0)
    $$bindings.warn(warn);
  if ($$props.warnText === void 0 && $$bindings.warnText && warnText !== void 0)
    $$bindings.warnText(warnText);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0)
    $$bindings.readonly(readonly);
  isFluid = !!ctx && ctx.isFluid;
  errorId = `error-${id}`;
  warnId = `warn-${id}`;
  return `
<div${add_classes([
    "bx--form-item bx--text-input-wrapper " + (inline ? "bx--text-input-wrapper--inline" : "") + " " + (light ? "bx--text-input-wrapper--light" : "") + " " + (readonly ? "bx--text-input-wrapper--readonly" : "")
  ].join(" ").trim())}>${inline ? `<div${add_classes(["bx--text-input__label-helper-wrapper"].join(" ").trim())}>${labelText ? `<label${add_attribute("for", id, 0)} class="${[
    escape2(inline && !!size && `bx--label--inline--${size}`),
    "bx--label " + (hideLabel ? "bx--visually-hidden" : "") + " " + (disabled ? "bx--label--disabled" : "") + " " + (inline ? "bx--label--inline" : "")
  ].join(" ").trim()}">${slots.labelText ? slots.labelText({}) : `
            ${escape2(labelText)}
          `}</label>` : ``}
      ${!isFluid && helperText ? `<div${add_classes([
    "bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "") + " " + (inline ? "bx--form__helper-text--inline" : "")
  ].join(" ").trim())}>${escape2(helperText)}</div>` : ``}</div>` : ``}
  ${!inline && labelText ? `<label${add_attribute("for", id, 0)} class="${[
    escape2(inline && !!size && `bx--label--inline--${size}`),
    "bx--label " + (hideLabel ? "bx--visually-hidden" : "") + " " + (disabled ? "bx--label--disabled" : "") + " " + (inline ? "bx--label--inline" : "")
  ].join(" ").trim()}">${slots.labelText ? slots.labelText({}) : `
        ${escape2(labelText)}
      `}</label>` : ``}
  <div${add_classes([
    "bx--text-input__field-outer-wrapper " + (inline ? "bx--text-input__field-outer-wrapper--inline" : "")
  ].join(" ").trim())}><div${add_attribute("data-invalid", invalid || void 0, 0)}${add_attribute("data-warn", warn || void 0, 0)}${add_classes([
    "bx--text-input__field-wrapper " + (!invalid && warn ? "bx--text-input__field-wrapper--warning" : "")
  ].join(" ").trim())}>${invalid ? `${validate_component(WarningFilled16, "WarningFilled16").$$render($$result, { class: "bx--text-input__invalid-icon" }, {}, {})}` : ``}
      ${!invalid && warn ? `${validate_component(WarningAltFilled16, "WarningAltFilled16").$$render($$result, {
    class: "bx--text-input__invalid-icon\n            bx--text-input__invalid-icon--warning"
  }, {}, {})}` : ``}
      ${readonly ? `${validate_component(EditOff16, "EditOff16").$$render($$result, { class: "bx--text-input__readonly-icon" }, {}, {})}` : ``}
      <input${spread([
    {
      "data-invalid": escape_attribute_value(invalid || void 0)
    },
    {
      "aria-invalid": escape_attribute_value(invalid || void 0)
    },
    {
      "data-warn": escape_attribute_value(warn || void 0)
    },
    {
      "aria-describedby": escape_attribute_value(invalid ? errorId : warn ? warnId : void 0)
    },
    { disabled: disabled || null },
    { id: escape_attribute_value(id) },
    { name: escape_attribute_value(name) },
    {
      placeholder: escape_attribute_value(placeholder)
    },
    { type: escape_attribute_value(type) },
    { value: escape_attribute_value(value) },
    { required: required || null },
    { readonly: readonly || null },
    escape_object($$restProps),
    {
      class: escape_attribute_value(size && `bx--text-input--${size}`)
    }
  ], "bx--text-input " + (light ? "bx--text-input--light" : "") + " " + (invalid ? "bx--text-input--invalid" : "") + " " + (warn ? "bx--text-input--warn" : ""))}${add_attribute("this", ref, 0)}>
      ${isFluid ? `<hr${add_classes(["bx--text-input__divider"].join(" ").trim())}>` : ``}
      ${isFluid && !inline && invalid ? `<div${add_attribute("id", errorId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(invalidText)}</div>` : ``}
      ${isFluid && !inline && warn ? `<div${add_attribute("id", warnId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(warnText)}</div>` : ``}</div>
    ${!invalid && !warn && !isFluid && !inline && helperText ? `<div${add_classes([
    "bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "") + " " + (inline ? "bx--form__helper-text--inline" : "")
  ].join(" ").trim())}>${escape2(helperText)}</div>` : ``}
    ${!isFluid && invalid ? `<div${add_attribute("id", errorId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(invalidText)}</div>` : ``}
    ${!isFluid && !invalid && warn ? `<div${add_attribute("id", warnId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(warnText)}</div>` : ``}</div></div>`;
});
var ArrowRight16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ArrowRight16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M9.3 3.7L13.1 7.5 1 7.5 1 8.5 13.1 8.5 9.3 12.3 10 13 15 8 10 3z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var TrashCan16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "TrashCan16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M12 12H14V24H12zM18 12H20V24H18z"}"></path><path d="${"M4 6V8H6V28a2 2 0 002 2H24a2 2 0 002-2V8h2V6zM8 28V8H24V28zM12 2H20V4H12z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var css$7 = {
  code: ".redirect-form-row.svelte-10bkv08{display:flex;align-items:flex-start;justify-content:space-between;gap:1em}.row-inline-container.svelte-10bkv08{height:64px;display:flex;align-items:flex-end}.redirect-from.svelte-10bkv08{flex:1}.redirect-to.svelte-10bkv08{flex:2}",
  map: `{"version":3,"file":"DomainEditForm.svelte","sources":["DomainEditForm.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Form from \\"carbon-components-svelte/src/Form/Form.svelte\\";\\nimport TextArea from \\"carbon-components-svelte/src/TextArea/TextArea.svelte\\";\\nimport TextInput from \\"carbon-components-svelte/src/TextInput/TextInput.svelte\\";\\nimport ArrowRight16 from 'carbon-icons-svelte/lib/ArrowRight16';\\nimport TrashCan16 from 'carbon-icons-svelte/lib/TrashCan16';\\nimport { createEventDispatcher } from 'svelte';\\nimport { Redirect } from '../../types';\\nimport { jsonPlaceholder } from '../../utils/consts';\\nexport let data = {};\\nexport let isEdit = false;\\nconst dispatch = createEventDispatcher();\\nfunction onSubmit() {\\n    dispatch('submit', data);\\n}\\nfunction addRedirect() {\\n    data.redirects = [...data.redirects, new Redirect()];\\n}\\nfunction removeRedir(index) {\\n    data.redirects = data.redirects.filter((value, i) => i !== index);\\n}\\n<\/script>\\n\\n<Form on:submit={onSubmit}>\\n\\t<div class=\\"block\\">\\n\\t\\t<TextInput\\n\\t\\t\\tbind:value={data.name}\\n\\t\\t\\tdisabled={isEdit}\\n\\t\\t\\tlabelText=\\"Domain name\\"\\n\\t\\t\\tplaceholder=\\"example.com or tenant.yoursite.com\\"\\n\\t\\t\\thelperText=\\"Enter a root domain or subdomain that your tenant will use to access your service\\"\\n\\t\\t/>\\n\\t</div>\\n\\t<div class=\\"block\\">\\n\\t\\t<TextArea\\n\\t\\t\\tbind:value={data.ipAddresses}\\n\\t\\t\\trows={2}\\n\\t\\t\\tlabelText=\\"IP Addresses\\"\\n\\t\\t\\thelperText=\\"Enter a comma-separated list of IP Addresses where your service is. Your tenant's domains will point to these. Enter more than 1 address for load-balancing.\\"\\n\\t\\t\\tplaceholder=\\"172.88.1.2,81.44.3.6\\"\\n\\t\\t/>\\n\\t</div>\\n\\t<div class=\\"block\\">\\n\\t\\t<TextArea\\n\\t\\t\\tbind:value={data.data}\\n\\t\\t\\trows={10}\\n\\t\\t\\tlabelText=\\"Tenant Data\\"\\n\\t\\t\\tplaceholder={jsonPlaceholder}\\n\\t\\t\\thelperText=\\"Generally the structure of this object will be consistent with all your tenants but the values should vary.\\"\\n\\t\\t/>\\n\\t</div>\\n\\t<div class=\\"block\\">\\n\\t\\t<div class=\\"block\\">\\n\\t\\t\\t<h5>Redirects</h5>\\n\\t\\t\\t<p>\\n\\t\\t\\t\\tRedirect from a path on the tenant's domain to some url that returns the relevant content\\n\\t\\t\\t\\tfor the tenant.\\n\\t\\t\\t</p>\\n\\t\\t</div>\\n\\t\\t{#each data.redirects as redir, index}\\n\\t\\t\\t<div class=\\"block redirect-form-row\\">\\n\\t\\t\\t\\t<div class=\\"redirect-from\\">\\n\\t\\t\\t\\t\\t<TextInput bind:value={redir.from} labelText=\\"From\\" placeholder=\\"/logo\\" />\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t<ArrowRight16 style=\\"position:relative; top:2.5em\\" />\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<div class=\\"redirect-to\\">\\n\\t\\t\\t\\t\\t<TextInput\\n\\t\\t\\t\\t\\t\\tbind:value={redir.to}\\n\\t\\t\\t\\t\\t\\tlabelText=\\"To\\"\\n\\t\\t\\t\\t\\t\\tplaceholder=\\"https://s3.aws.com/example-customer-logo.png\\"\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<div class=\\"row-inline-container\\">\\n\\t\\t\\t\\t\\t<Button\\n\\t\\t\\t\\t\\t\\tkind=\\"danger-tertiary\\"\\n\\t\\t\\t\\t\\t\\tsize=\\"field\\"\\n\\t\\t\\t\\t\\t\\ticonDescription=\\"Delete\\"\\n\\t\\t\\t\\t\\t\\ticon={TrashCan16}\\n\\t\\t\\t\\t\\t\\ton:click={() => removeRedir(index)}\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t{/each}\\n\\t\\t<Button kind=\\"tertiary\\" size=\\"field\\" on:click={addRedirect}>+ Add A Redirect</Button>\\n\\t</div>\\n</Form>\\n\\n<style>\\n\\t.redirect-form-row {\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: flex-start;\\n\\t\\tjustify-content: space-between;\\n\\t\\tgap: 1em;\\n\\t}\\n\\n\\t.row-inline-container {\\n\\t\\theight: 64px;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: flex-end;\\n\\t}\\n\\n\\t.redirect-from {\\n\\t\\tflex: 1;\\n\\t}\\n\\t.redirect-to {\\n\\t\\tflex: 2;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0FC,kBAAkB,eAAC,CAAC,AACnB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,UAAU,CACvB,eAAe,CAAE,aAAa,CAC9B,GAAG,CAAE,GAAG,AACT,CAAC,AAED,qBAAqB,eAAC,CAAC,AACtB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,QAAQ,AACtB,CAAC,AAED,cAAc,eAAC,CAAC,AACf,IAAI,CAAE,CAAC,AACR,CAAC,AACD,YAAY,eAAC,CAAC,AACb,IAAI,CAAE,CAAC,AACR,CAAC"}`
};
var DomainEditForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data = {} } = $$props;
  let { isEdit = false } = $$props;
  createEventDispatcher();
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0)
    $$bindings.isEdit(isEdit);
  $$result.css.add(css$7);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Form, "Form").$$render($$result, {}, {}, {
      default: () => `<div class="${"block"}">${validate_component(TextInput, "TextInput").$$render($$result, {
        disabled: isEdit,
        labelText: "Domain name",
        placeholder: "example.com or tenant.yoursite.com",
        helperText: "Enter a root domain or subdomain that your tenant will use to access your service",
        value: data.name
      }, {
        value: ($$value) => {
          data.name = $$value;
          $$settled = false;
        }
      }, {})}</div>
	<div class="${"block"}">${validate_component(TextArea, "TextArea").$$render($$result, {
        rows: 2,
        labelText: "IP Addresses",
        helperText: "Enter a comma-separated list of IP Addresses where your service is. Your tenant's domains will point to these. Enter more than 1 address for load-balancing.",
        placeholder: "172.88.1.2,81.44.3.6",
        value: data.ipAddresses
      }, {
        value: ($$value) => {
          data.ipAddresses = $$value;
          $$settled = false;
        }
      }, {})}</div>
	<div class="${"block"}">${validate_component(TextArea, "TextArea").$$render($$result, {
        rows: 10,
        labelText: "Tenant Data",
        placeholder: jsonPlaceholder,
        helperText: "Generally the structure of this object will be consistent with all your tenants but the values should vary.",
        value: data.data
      }, {
        value: ($$value) => {
          data.data = $$value;
          $$settled = false;
        }
      }, {})}</div>
	<div class="${"block"}"><div class="${"block"}"><h5>Redirects</h5>
			<p>Redirect from a path on the tenant&#39;s domain to some url that returns the relevant content
				for the tenant.
			</p></div>
		${each(data.redirects, (redir, index2) => `<div class="${"block redirect-form-row svelte-10bkv08"}"><div class="${"redirect-from svelte-10bkv08"}">${validate_component(TextInput, "TextInput").$$render($$result, {
        labelText: "From",
        placeholder: "/logo",
        value: redir.from
      }, {
        value: ($$value) => {
          redir.from = $$value;
          $$settled = false;
        }
      }, {})}</div>
				<div>${validate_component(ArrowRight16, "ArrowRight16").$$render($$result, { style: "position:relative; top:2.5em" }, {}, {})}</div>
				<div class="${"redirect-to svelte-10bkv08"}">${validate_component(TextInput, "TextInput").$$render($$result, {
        labelText: "To",
        placeholder: "https://s3.aws.com/example-customer-logo.png",
        value: redir.to
      }, {
        value: ($$value) => {
          redir.to = $$value;
          $$settled = false;
        }
      }, {})}</div>
				<div class="${"row-inline-container svelte-10bkv08"}">${validate_component(Button, "Button").$$render($$result, {
        kind: "danger-tertiary",
        size: "field",
        iconDescription: "Delete",
        icon: TrashCan16
      }, {}, {})}</div>
			</div>`)}
		${validate_component(Button, "Button").$$render($$result, { kind: "tertiary", size: "field" }, {}, { default: () => `+ Add A Redirect` })}</div>`
    })}`;
  } while (!$$settled);
  return $$rendered;
});
var css$6 = {
  code: ".data-header.svelte-1qtkyyh{background-color:#0f62fe;color:white;padding:0.7rem 1rem}",
  map: `{"version":3,"file":"DomainEditDialog.svelte","sources":["DomainEditDialog.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher } from 'svelte';\\nimport Modal from \\"carbon-components-svelte/src/Modal/Modal.svelte\\";\\nimport { toDomainConfigInput, toDomainForm } from '../../types';\\nimport DomainEditForm from '../forms/DomainEditForm.svelte';\\nexport let data = [{}];\\nexport let isEdit = false;\\nexport let isOpen = false;\\n$: entries = data.map(toDomainForm);\\nconst dispatch = createEventDispatcher();\\nfunction closeModal(data, doSumbit) {\\n    if (doSumbit) {\\n        const domainInput = data.map(toDomainConfigInput);\\n        dispatch('submit', {\\n            data: domainInput\\n        });\\n    }\\n    isOpen = false;\\n}\\n<\/script>\\n\\n<Modal\\n\\tbind:open={isOpen}\\n\\tmodalHeading={isEdit ? 'Edit domains' : 'Create a domain'}\\n\\tprimaryButtonText={isEdit ? 'Save Changes' : 'Create domain'}\\n\\tsecondaryButtonText=\\"Cancel\\"\\n\\ton:click:button--secondary={() => closeModal(null, false)}\\n\\ton:open\\n\\ton:close\\n\\ton:submit={() => closeModal(entries, true)}\\n>\\n\\t{#each entries as dataInput}\\n\\t\\t{#if isEdit}\\n\\t\\t\\t<h4 class=\\"block data-header\\">{dataInput.name}</h4>\\n\\t\\t{/if}\\n\\t\\t{#if isOpen}\\n\\t\\t\\t<DomainEditForm {isEdit} data={dataInput} />\\n\\t\\t{/if}\\n\\t{/each}\\n</Modal>\\n\\n<style>\\n\\t.data-header {\\n\\t\\tbackground-color: #0f62fe;\\n\\t\\tcolor: white;\\n\\t\\tpadding: 0.7rem 1rem;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAyCC,YAAY,eAAC,CAAC,AACb,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,MAAM,CAAC,IAAI,AACrB,CAAC"}`
};
var DomainEditDialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let entries;
  let { data = [{}] } = $$props;
  let { isEdit = false } = $$props;
  let { isOpen = false } = $$props;
  createEventDispatcher();
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0)
    $$bindings.isEdit(isEdit);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0)
    $$bindings.isOpen(isOpen);
  $$result.css.add(css$6);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    entries = data.map(toDomainForm);
    $$rendered = `${validate_component(Modal, "Modal").$$render($$result, {
      modalHeading: isEdit ? "Edit domains" : "Create a domain",
      primaryButtonText: isEdit ? "Save Changes" : "Create domain",
      secondaryButtonText: "Cancel",
      open: isOpen
    }, {
      open: ($$value) => {
        isOpen = $$value;
        $$settled = false;
      }
    }, {
      default: () => `${each(entries, (dataInput) => `${isEdit ? `<h4 class="${"block data-header svelte-1qtkyyh"}">${escape2(dataInput.name)}</h4>` : ``}
		${isOpen ? `${validate_component(DomainEditForm, "DomainEditForm").$$render($$result, { isEdit, data: dataInput }, {}, {})}` : ``}`)}`
    })}`;
  } while (!$$settled);
  return $$rendered;
});
var css$5 = {
  code: ".expanded-row.svelte-1s55gtg{padding-top:0.5em;padding-bottom:0.5em}.loading-row.svelte-1s55gtg{display:flex;justify-content:flex-end;margin-right:2em}",
  map: `{"version":3,"file":"DomainTable.svelte","sources":["DomainTable.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Checkbox from \\"carbon-components-svelte/src/Checkbox/Checkbox.svelte\\";\\nimport ComposedModal from \\"carbon-components-svelte/src/ComposedModal/ComposedModal.svelte\\";\\nimport DataTable from \\"carbon-components-svelte/src/DataTable/DataTable.svelte\\";\\nimport DataTableSkeleton from \\"carbon-components-svelte/src/DataTable/DataTableSkeleton.svelte\\";\\nimport InlineLoading from \\"carbon-components-svelte/src/InlineLoading/InlineLoading.svelte\\";\\nimport Link from \\"carbon-components-svelte/src/Link/Link.svelte\\";\\nimport ModalBody from \\"carbon-components-svelte/src/ComposedModal/ModalBody.svelte\\";\\nimport ModalFooter from \\"carbon-components-svelte/src/ComposedModal/ModalFooter.svelte\\";\\nimport ModalHeader from \\"carbon-components-svelte/src/ComposedModal/ModalHeader.svelte\\";\\nimport Toolbar from \\"carbon-components-svelte/src/DataTable/Toolbar.svelte\\";\\nimport ToolbarBatchActions from \\"carbon-components-svelte/src/DataTable/ToolbarBatchActions.svelte\\";\\nimport ToolbarContent from \\"carbon-components-svelte/src/DataTable/ToolbarContent.svelte\\";\\nimport Delete16 from 'carbon-icons-svelte/lib/Delete16';\\nimport Edit16 from 'carbon-icons-svelte/lib/Edit16';\\nimport { createDomain, createDomain$, deleteDomains, editDomains } from '../../store';\\nimport ConfigDialog from '../dialogs/ConfigDialog.svelte';\\nimport DomainEditDialog from '../dialogs/DomainEditDialog.svelte';\\nexport let rows = [];\\nexport let isLoading = false;\\nlet selectedRowIds = [];\\nlet expandedRowIds = [];\\nconst headers = [\\n    { key: 'name', value: 'Name' },\\n    { key: 'ipAddresses', value: 'IP Addresses' },\\n    { key: 'data', value: 'Custom Data' },\\n    { key: 'redirects', value: 'Redirects' }\\n];\\nlet domainModalOpen = false;\\nlet domainModalIsEdit = false;\\nlet domainModalData;\\nlet confirmDeleteOpened = false;\\nlet confirmDeleteCheck = false;\\nfunction toggleRow(id) {\\n    if (expandedRowIds.includes(id)) {\\n        expandedRowIds = expandedRowIds.filter((rowId) => rowId !== id);\\n    }\\n    else {\\n        const list = [...expandedRowIds, id];\\n        expandedRowIds = Array.from(new Set(list));\\n    }\\n}\\nfunction openDomainEditForm(isEdit) {\\n    domainModalIsEdit = isEdit;\\n    domainModalData = isEdit\\n        ? rows.filter((row) => selectedRowIds.includes(row.id))\\n        : [{}];\\n    domainModalOpen = true;\\n}\\nfunction formatRedirect(redir) {\\n    if (redir) {\\n        return \`\${redir.from} \u2192 \${redir.to}\`;\\n    }\\n    return '';\\n}\\nfunction onDialogSubmit(event) {\\n    if (domainModalIsEdit) {\\n        const submission = event.detail.data;\\n        editDomains.dispatch(submission);\\n    }\\n    else {\\n        const submission = event.detail.data[0];\\n        createDomain.dispatch(submission);\\n    }\\n}\\nfunction onDeleteSubmit() {\\n    confirmDeleteOpened = false;\\n    confirmDeleteCheck = false;\\n    deleteDomains.dispatch(selectedRowIds.map((id) => rows.find((r) => r.id === id).name));\\n    selectedRowIds = [];\\n}\\n<\/script>\\n\\n{#if !isLoading}\\n\\t<DataTable\\n\\t\\tzebra\\n\\t\\texpandable\\n\\t\\tbatchSelection\\n\\t\\t{expandedRowIds}\\n\\t\\tbind:selectedRowIds\\n\\t\\t{headers}\\n\\t\\t{rows}\\n\\t\\ton:click:row={(e) => toggleRow(e.detail.id)}\\n\\t>\\n\\t\\t<Toolbar>\\n\\t\\t\\t<ToolbarBatchActions>\\n\\t\\t\\t\\t<Button icon={Edit16} on:click={() => openDomainEditForm(true)}>Edit</Button>\\n\\t\\t\\t\\t<Button icon={Delete16} on:click={() => (confirmDeleteOpened = true)}>Delete</Button>\\n\\t\\t\\t</ToolbarBatchActions>\\n\\t\\t\\t<ToolbarContent>\\n\\t\\t\\t\\t{#if !$createDomain$.isLoading}\\n\\t\\t\\t\\t\\t<Button on:click={() => openDomainEditForm(false)}>+ Create A Domain</Button>\\n\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t<div class=\\"loading-row\\">\\n\\t\\t\\t\\t\\t\\t<InlineLoading />\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t</ToolbarContent>\\n\\t\\t</Toolbar>\\n\\n\\t\\t<div slot=\\"expanded-row\\" let:row class=\\"expanded-row\\">\\n\\t\\t\\t<h5>Redirects</h5>\\n\\t\\t\\t{#if row.redirects.length}\\n\\t\\t\\t\\t{#each row.redirects as redir, i}\\n\\t\\t\\t\\t\\t{formatRedirect(redir)}\\n\\t\\t\\t\\t\\t{#if i !== row.redirects.length - 1}\\n\\t\\t\\t\\t\\t\\t<br />\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t{/each}\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\tNone\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\n\\t\\t<div slot=\\"cell\\" let:row let:cell>\\n\\t\\t\\t<span>\\n\\t\\t\\t\\t{#if cell.key === 'data'}\\n\\t\\t\\t\\t\\t{#if row.redirects.length}\\n\\t\\t\\t\\t\\t\\t<ConfigDialog data={row} />\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\tNone\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t{:else if cell.key === 'redirects'}\\n\\t\\t\\t\\t\\t{#if row.redirects.length}\\n\\t\\t\\t\\t\\t\\t<Link style=\\"cursor: pointer\\">Expand</Link>\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\tNone\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t{cell.value}\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t</span>\\n\\t\\t</div>\\n\\t</DataTable>\\n{:else}\\n\\t<DataTableSkeleton {headers} rows={5} />\\n{/if}\\n\\n<DomainEditDialog\\n\\tisOpen={domainModalOpen}\\n\\tisEdit={domainModalIsEdit}\\n\\tdata={domainModalData}\\n\\ton:submit={(data) => onDialogSubmit(data)}\\n\\ton:close={() => (domainModalOpen = false)}\\n/>\\n\\n<ComposedModal\\n\\topen={confirmDeleteOpened}\\n\\ton:submit={onDeleteSubmit}\\n\\ton:close={() => (confirmDeleteOpened = false)}\\n>\\n\\t<ModalHeader title=\\"Confirm Deletion\\" />\\n\\t<ModalBody hasForm>\\n\\t\\t<p class=\\"block\\">\\n\\t\\t\\t{#each selectedRowIds as id}\\n\\t\\t\\t\\t{rows?.find((r) => r.id === id)?.name}\\n\\t\\t\\t\\t<br />\\n\\t\\t\\t{/each}\\n\\t\\t</p>\\n\\t\\t<Checkbox labelText=\\"I wish to delete the above domains\\" bind:checked={confirmDeleteCheck} />\\n\\t</ModalBody>\\n\\t<ModalFooter\\n\\t\\tdanger={true}\\n\\t\\tprimaryButtonText=\\"Delete Domains\\"\\n\\t\\tsecondaryButtonText=\\"Cancel\\"\\n\\t\\tprimaryButtonDisabled={!confirmDeleteCheck}\\n\\t/>\\n</ComposedModal>\\n\\n<style>\\n\\t.expanded-row {\\n\\t\\tpadding-top: 0.5em;\\n\\t\\tpadding-bottom: 0.5em;\\n\\t}\\n\\t.loading-row {\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: flex-end;\\n\\t\\tmargin-right: 2em;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0KC,aAAa,eAAC,CAAC,AACd,WAAW,CAAE,KAAK,CAClB,cAAc,CAAE,KAAK,AACtB,CAAC,AACD,YAAY,eAAC,CAAC,AACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,QAAQ,CACzB,YAAY,CAAE,GAAG,AAClB,CAAC"}`
};
function formatRedirect(redir) {
  if (redir) {
    return `${redir.from} \u2192 ${redir.to}`;
  }
  return "";
}
var DomainTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $createDomain$, $$unsubscribe_createDomain$;
  $$unsubscribe_createDomain$ = subscribe(createDomain$, (value) => $createDomain$ = value);
  let { rows = [] } = $$props;
  let { isLoading = false } = $$props;
  let selectedRowIds = [];
  let expandedRowIds = [];
  const headers = [
    { key: "name", value: "Name" },
    {
      key: "ipAddresses",
      value: "IP Addresses"
    },
    { key: "data", value: "Custom Data" },
    { key: "redirects", value: "Redirects" }
  ];
  let domainModalOpen = false;
  let domainModalIsEdit = false;
  let domainModalData;
  let confirmDeleteOpened = false;
  let confirmDeleteCheck = false;
  if ($$props.rows === void 0 && $$bindings.rows && rows !== void 0)
    $$bindings.rows(rows);
  if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading !== void 0)
    $$bindings.isLoading(isLoading);
  $$result.css.add(css$5);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${!isLoading ? `${validate_component(DataTable, "DataTable").$$render($$result, {
      zebra: true,
      expandable: true,
      batchSelection: true,
      expandedRowIds,
      headers,
      rows,
      selectedRowIds
    }, {
      selectedRowIds: ($$value) => {
        selectedRowIds = $$value;
        $$settled = false;
      }
    }, {
      cell: ({ cell, row }) => `<div slot="${"cell"}"><span>${cell.key === "data" ? `${row.redirects.length ? `${validate_component(ConfigDialog, "ConfigDialog").$$render($$result, { data: row }, {}, {})}` : `None`}` : `${cell.key === "redirects" ? `${row.redirects.length ? `${validate_component(Link, "Link").$$render($$result, { style: "cursor: pointer" }, {}, { default: () => `Expand` })}` : `None`}` : `${escape2(cell.value)}`}`}</span></div>`,
      "expanded-row": ({ row }) => `<div slot="${"expanded-row"}" class="${"expanded-row svelte-1s55gtg"}"><h5>Redirects</h5>
			${row.redirects.length ? `${each(row.redirects, (redir, i) => `${escape2(formatRedirect(redir))}
					${i !== row.redirects.length - 1 ? `<br>` : ``}`)}` : `None`}</div>`,
      default: () => `${validate_component(Toolbar, "Toolbar").$$render($$result, {}, {}, {
        default: () => `${validate_component(ToolbarBatchActions, "ToolbarBatchActions").$$render($$result, {}, {}, {
          default: () => `${validate_component(Button, "Button").$$render($$result, { icon: Edit16 }, {}, { default: () => `Edit` })}
				${validate_component(Button, "Button").$$render($$result, { icon: Delete16 }, {}, { default: () => `Delete` })}`
        })}
			${validate_component(ToolbarContent, "ToolbarContent").$$render($$result, {}, {}, {
          default: () => `${!$createDomain$.isLoading ? `${validate_component(Button, "Button").$$render($$result, {}, {}, { default: () => `+ Create A Domain` })}` : `<div class="${"loading-row svelte-1s55gtg"}">${validate_component(InlineLoading, "InlineLoading").$$render($$result, {}, {}, {})}</div>`}`
        })}`
      })}`
    })}` : `${validate_component(DataTableSkeleton, "DataTableSkeleton").$$render($$result, { headers, rows: 5 }, {}, {})}`}

${validate_component(DomainEditDialog, "DomainEditDialog").$$render($$result, {
      isOpen: domainModalOpen,
      isEdit: domainModalIsEdit,
      data: domainModalData
    }, {}, {})}

${validate_component(ComposedModal, "ComposedModal").$$render($$result, { open: confirmDeleteOpened }, {}, {
      default: () => `${validate_component(ModalHeader, "ModalHeader").$$render($$result, { title: "Confirm Deletion" }, {}, {})}
	${validate_component(ModalBody, "ModalBody").$$render($$result, { hasForm: true }, {}, {
        default: () => `<p class="${"block"}">${each(selectedRowIds, (id) => {
          var _a;
          return `${escape2((_a = rows == null ? void 0 : rows.find((r) => r.id === id)) == null ? void 0 : _a.name)}
				<br>`;
        })}</p>
		${validate_component(Checkbox, "Checkbox").$$render($$result, {
          labelText: "I wish to delete the above domains",
          checked: confirmDeleteCheck
        }, {
          checked: ($$value) => {
            confirmDeleteCheck = $$value;
            $$settled = false;
          }
        }, {})}`
      })}
	${validate_component(ModalFooter, "ModalFooter").$$render($$result, {
        danger: true,
        primaryButtonText: "Delete Domains",
        secondaryButtonText: "Cancel",
        primaryButtonDisabled: !confirmDeleteCheck
      }, {}, {})}`
    })}`;
  } while (!$$settled);
  $$unsubscribe_createDomain$();
  return $$rendered;
});
var Domains = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $accountDomains$, $$unsubscribe_accountDomains$;
  $$unsubscribe_accountDomains$ = subscribe(accountDomains$, (value) => $accountDomains$ = value);
  $$unsubscribe_accountDomains$();
  return `<h1>Domains</h1>

<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<h3>Getting Started</h3>
		<p>Configure the domains that you manage on behalf of your tenants. All domains automatically
			have TLS certificates.
		</p>
		<p>Check a row to edit or delete 1 or more domains. Here are some things that you can configure
			for a domain:
		</p>
		<br>
		<ul><li><b>The IP Address of your backend service.</b> If you enter more than 1, AppMasker will load
				balance between them. Your tenants will need to create either a CNAME (for subdomains) or A/AAAA
				(for root domains) record pointed to xxx.xx.xx.x
			</li>
			
			<li><b>Enter custom JSON data.</b> You can query this data from our API later. Use it to adjust your
				app&#39;s UI for the tenant or enable other dynamic functionality.
			</li>
			<li><b>Create Redirects.</b>\xA0For example, you could have the <code>/logo</code> path for any
				domain redirect to the tenant&#39;s logo (some url).
			</li></ul>`
  })}</div>
<div class="${"block"}">${validate_component(DomainTable, "DomainTable").$$render($$result, {
    rows: $accountDomains$.data.domains,
    isLoading: $accountDomains$.isLoading
  }, {}, {})}</div>`;
});
var domains = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Domains
});
var Help = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Help</h1>

<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<h3>Questions?</h3>
		<div class="${"block"}"><p>Send an email to ${validate_component(Link, "Link").$$render($$result, {
      href: "mailto:support@appmasker.com?subject=Help%20with%20AppMasker&body=I%20have%20a%20question%20about%20AppMasker."
    }, {}, { default: () => `support@appmasker.com` })}</p></div>`
  })}</div>`;
});
var help = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Help
});
var ChevronDown16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ChevronDown16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M8 11L3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var Copy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["feedback", "feedbackTimeout", "ref"]);
  let { feedback = "Copied!" } = $$props;
  let { feedbackTimeout = 2e3 } = $$props;
  let { ref = null } = $$props;
  let animation = void 0;
  if ($$props.feedback === void 0 && $$bindings.feedback && feedback !== void 0)
    $$bindings.feedback(feedback);
  if ($$props.feedbackTimeout === void 0 && $$bindings.feedbackTimeout && feedbackTimeout !== void 0)
    $$bindings.feedbackTimeout(feedbackTimeout);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  return `<button${spread([
    { type: "button" },
    { "aria-live": "polite" },
    {
      "aria-label": escape_attribute_value(void 0)
    },
    escape_object($$restProps),
    {
      class: escape2($$restProps.class) + " " + escape2(animation)
    }
  ], "bx--copy ")}${add_attribute("this", ref, 0)}>${slots.default ? slots.default({}) : `
    ${``}
  `}
  <span aria-hidden="${"true"}"${add_classes([
    "bx--assistive-text bx--copy-btn__feedback"
  ].join(" ").trim())}>${escape2(feedback)}</span></button>`;
});
var Copy16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "Copy16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 32 32" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M28,10V28H10V10H28m0-2H10a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2Z"}"></path><path d="${"M4,18H2V4A2,2,0,0,1,4,2H18V4H4Z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var CopyButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["iconDescription", "text", "copy"]);
  let { iconDescription = "Copy to clipboard" } = $$props;
  let { text = void 0 } = $$props;
  let { copy = async (text2) => {
    try {
      await navigator.clipboard.writeText(text2);
    } catch (e) {
      console.log(e);
    }
  } } = $$props;
  createEventDispatcher();
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.copy === void 0 && $$bindings.copy && copy !== void 0)
    $$bindings.copy(copy);
  return `${validate_component(Copy, "Copy").$$render($$result, Object.assign({ class: "bx--copy-btn" }, { "aria-label": iconDescription }, { title: iconDescription }, $$restProps), {}, {
    default: () => `${validate_component(Copy16, "Copy16").$$render($$result, { class: "bx--snippet__icon" }, {}, {})}`
  })}`;
});
var CodeSnippetSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["type"]);
  let { type = "single" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  return `
<div${spread([escape_object($$restProps)], "bx--skeleton bx--snippet " + (type === "single" ? "bx--snippet--single" : "") + " " + (type === "multi" ? "bx--snippet--multi" : ""))}><div${add_classes(["bx--snippet-container"].join(" ").trim())}>${type === "single" ? `<span></span>` : `${type === "multi" ? `<span></span> <span></span> <span></span>` : ``}`}</div></div>`;
});
var CodeSnippet = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let expandText;
  let minHeight;
  let maxHeight;
  let $$restProps = compute_rest_props($$props, [
    "type",
    "code",
    "copy",
    "expanded",
    "hideCopyButton",
    "disabled",
    "wrapText",
    "light",
    "skeleton",
    "copyButtonDescription",
    "copyLabel",
    "feedback",
    "feedbackTimeout",
    "showLessText",
    "showMoreText",
    "showMoreLess",
    "id",
    "ref"
  ]);
  let { type = "single" } = $$props;
  let { code = void 0 } = $$props;
  let { copy = async (code2) => {
    try {
      await navigator.clipboard.writeText(code2);
    } catch (e) {
      console.log(e);
    }
  } } = $$props;
  let { expanded = false } = $$props;
  let { hideCopyButton = false } = $$props;
  let { disabled = false } = $$props;
  let { wrapText = false } = $$props;
  let { light = false } = $$props;
  let { skeleton = false } = $$props;
  let { copyButtonDescription = void 0 } = $$props;
  let { copyLabel = void 0 } = $$props;
  let { feedback = "Copied!" } = $$props;
  let { feedbackTimeout = 2e3 } = $$props;
  let { showLessText = "Show less" } = $$props;
  let { showMoreText = "Show more" } = $$props;
  let { showMoreLess = false } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { ref = null } = $$props;
  createEventDispatcher();
  function setShowMoreLess() {
    const { height } = ref.getBoundingClientRect();
    if (height > 0)
      showMoreLess = ref.getBoundingClientRect().height > 255;
  }
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.code === void 0 && $$bindings.code && code !== void 0)
    $$bindings.code(code);
  if ($$props.copy === void 0 && $$bindings.copy && copy !== void 0)
    $$bindings.copy(copy);
  if ($$props.expanded === void 0 && $$bindings.expanded && expanded !== void 0)
    $$bindings.expanded(expanded);
  if ($$props.hideCopyButton === void 0 && $$bindings.hideCopyButton && hideCopyButton !== void 0)
    $$bindings.hideCopyButton(hideCopyButton);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.wrapText === void 0 && $$bindings.wrapText && wrapText !== void 0)
    $$bindings.wrapText(wrapText);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.skeleton === void 0 && $$bindings.skeleton && skeleton !== void 0)
    $$bindings.skeleton(skeleton);
  if ($$props.copyButtonDescription === void 0 && $$bindings.copyButtonDescription && copyButtonDescription !== void 0)
    $$bindings.copyButtonDescription(copyButtonDescription);
  if ($$props.copyLabel === void 0 && $$bindings.copyLabel && copyLabel !== void 0)
    $$bindings.copyLabel(copyLabel);
  if ($$props.feedback === void 0 && $$bindings.feedback && feedback !== void 0)
    $$bindings.feedback(feedback);
  if ($$props.feedbackTimeout === void 0 && $$bindings.feedbackTimeout && feedbackTimeout !== void 0)
    $$bindings.feedbackTimeout(feedbackTimeout);
  if ($$props.showLessText === void 0 && $$bindings.showLessText && showLessText !== void 0)
    $$bindings.showLessText(showLessText);
  if ($$props.showMoreText === void 0 && $$bindings.showMoreText && showMoreText !== void 0)
    $$bindings.showMoreText(showMoreText);
  if ($$props.showMoreLess === void 0 && $$bindings.showMoreLess && showMoreLess !== void 0)
    $$bindings.showMoreLess(showMoreLess);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  expandText = expanded ? showLessText : showMoreText;
  minHeight = expanded ? 16 * 15 : 48;
  maxHeight = expanded ? "none" : 16 * 15 + "px";
  {
    if (type === "multi" && ref) {
      if (code === void 0)
        setShowMoreLess();
      if (code)
        tick().then(setShowMoreLess);
    }
  }
  return `
${skeleton ? `${validate_component(CodeSnippetSkeleton, "CodeSnippetSkeleton").$$render($$result, Object.assign({ type }, $$restProps), {}, {})}` : `${type === "inline" ? `${hideCopyButton ? `<span${spread([escape_object($$restProps)], "bx--snippet " + (expanded ? "bx--snippet--expand" : "") + " " + (light ? "bx--snippet--light" : "") + " " + (hideCopyButton ? "bx--snippet--no-copy" : "") + " " + (wrapText ? "bx--snippet--wraptext" : "") + " " + (type === "single" ? "bx--snippet--single" : "") + " " + (type === "inline" ? "bx--snippet--inline" : "") + " " + (type === "multi" ? "bx--snippet--multi" : ""))}><code${add_attribute("id", id, 0)}>${slots.default ? slots.default({}) : `${escape2(code)}`}</code></span>` : `${validate_component(Copy, "Copy").$$render($$result, Object.assign({ "aria-label": copyLabel }, { "aria-describedby": id }, { feedback }, { feedbackTimeout }, {
    class: "bx--snippet " + (type && `bx--snippet--${type}`) + "\n          " + (type === "inline" && "bx--btn--copy") + "\n          " + (expanded && "bx--snippet--expand") + "\n          " + (light && "bx--snippet--light") + "\n          " + (hideCopyButton && "bx--snippet--no-copy") + "\n          " + (wrapText && "bx--snippet--wraptext")
  }, $$restProps), {}, {
    default: () => `<code${add_attribute("id", id, 0)}>${slots.default ? slots.default({}) : `${escape2(code)}`}</code>`
  })}`}` : `<div${spread([escape_object($$restProps)], "bx--snippet " + (expanded ? "bx--snippet--expand" : "") + " " + (light ? "bx--snippet--light" : "") + " " + (hideCopyButton ? "bx--snippet--no-copy" : "") + " " + (wrapText ? "bx--snippet--wraptext" : "") + " " + (type === "single" ? "bx--snippet--single" : "") + " " + (type === "inline" ? "bx--snippet--inline" : "") + " " + (type === "multi" ? "bx--snippet--multi" : "") + " " + (type !== "inline" && disabled ? "bx--snippet--disabled" : ""))}><div${add_attribute("role", type === "single" ? "textbox" : void 0, 0)}${add_attribute("tabindex", type === "single" && !disabled ? "0" : void 0, 0)}${add_attribute("aria-label", $$restProps["aria-label"] || copyLabel || "code-snippet", 0)} style="${"width: 100%; min-height: " + escape2(minHeight) + "px; max-height: " + escape2(maxHeight)}"${add_classes(["bx--snippet-container"].join(" ").trim())}><pre${add_attribute("this", ref, 0)}><code>${slots.default ? slots.default({}) : `${escape2(code)}`}</code></pre></div>
    ${!hideCopyButton ? `${validate_component(CopyButton, "CopyButton").$$render($$result, {
    disabled,
    feedback,
    feedbackTimeout,
    iconDescription: copyButtonDescription
  }, {}, {})}` : ``}
    ${showMoreLess ? `${validate_component(Button, "Button").$$render($$result, {
    kind: "ghost",
    size: "field",
    class: "bx--snippet-btn--expand",
    disabled
  }, {}, {
    default: () => `<span${add_classes(["bx--snippet-btn--text"].join(" ").trim())}>${escape2(expandText)}</span>
        ${validate_component(ChevronDown16, "ChevronDown16").$$render($$result, {
      class: "bx--icon-chevron--down bx--snippet__icon",
      "aria-label": expandText
    }, {}, {})}`
  })}` : ``}</div>`}`}`;
});
var InlineNotification = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "kind",
    "lowContrast",
    "timeout",
    "role",
    "title",
    "subtitle",
    "hideCloseButton",
    "iconDescription"
  ]);
  let { kind = "error" } = $$props;
  let { lowContrast = false } = $$props;
  let { timeout: timeout2 = 0 } = $$props;
  let { role = "alert" } = $$props;
  let { title = "" } = $$props;
  let { subtitle = "" } = $$props;
  let { hideCloseButton = false } = $$props;
  let { iconDescription = "Closes notification" } = $$props;
  createEventDispatcher();
  if ($$props.kind === void 0 && $$bindings.kind && kind !== void 0)
    $$bindings.kind(kind);
  if ($$props.lowContrast === void 0 && $$bindings.lowContrast && lowContrast !== void 0)
    $$bindings.lowContrast(lowContrast);
  if ($$props.timeout === void 0 && $$bindings.timeout && timeout2 !== void 0)
    $$bindings.timeout(timeout2);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0)
    $$bindings.subtitle(subtitle);
  if ($$props.hideCloseButton === void 0 && $$bindings.hideCloseButton && hideCloseButton !== void 0)
    $$bindings.hideCloseButton(hideCloseButton);
  if ($$props.iconDescription === void 0 && $$bindings.iconDescription && iconDescription !== void 0)
    $$bindings.iconDescription(iconDescription);
  return `
${`<div${spread([
    { role: escape_attribute_value(role) },
    { kind: escape_attribute_value(kind) },
    escape_object($$restProps)
  ], "bx--inline-notification " + (lowContrast ? "bx--inline-notification--low-contrast" : "") + " " + (hideCloseButton ? "bx--inline-notification--hide-close-button" : "") + " " + (kind === "error" ? "bx--inline-notification--error" : "") + " " + (kind === "info" ? "bx--inline-notification--info" : "") + " " + (kind === "info-square" ? "bx--inline-notification--info-square" : "") + " " + (kind === "success" ? "bx--inline-notification--success" : "") + " " + (kind === "warning" ? "bx--inline-notification--warning" : "") + " " + (kind === "warning-alt" ? "bx--inline-notification--warning-alt" : ""))}><div${add_classes(["bx--inline-notification__details"].join(" ").trim())}>${validate_component(NotificationIcon, "NotificationIcon").$$render($$result, { notificationType: "inline", kind }, {}, {})}
      ${validate_component(NotificationTextDetails, "NotificationTextDetails").$$render($$result, {
    title,
    subtitle,
    notificationType: "inline"
  }, {}, {
    default: () => `${slots.default ? slots.default({}) : ``}`
  })}</div>
    ${slots.actions ? slots.actions({}) : ``}
    ${!hideCloseButton ? `${validate_component(NotificationButton, "NotificationButton").$$render($$result, {
    iconDescription,
    notificationType: "inline"
  }, {}, {})}` : ``}</div>`}`;
});
var BreadcrumbSkeleton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["noTrailingSlash", "count"]);
  let { noTrailingSlash = false } = $$props;
  let { count = 3 } = $$props;
  if ($$props.noTrailingSlash === void 0 && $$bindings.noTrailingSlash && noTrailingSlash !== void 0)
    $$bindings.noTrailingSlash(noTrailingSlash);
  if ($$props.count === void 0 && $$bindings.count && count !== void 0)
    $$bindings.count(count);
  return `
<div${spread([escape_object($$restProps)], "bx--skeleton bx--breadcrumb " + (noTrailingSlash ? "bx--breadcrumb--no-trailing-slash" : ""))}>${each(Array.from({ length: count }, (_, i) => i), (item) => `<div${add_classes(["bx--breadcrumb-item"].join(" ").trim())}><span${add_classes(["bx--link"].join(" ").trim())}>\xA0</span>
    </div>`)}</div>`;
});
var Breadcrumb = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["noTrailingSlash", "skeleton"]);
  let { noTrailingSlash = false } = $$props;
  let { skeleton = false } = $$props;
  if ($$props.noTrailingSlash === void 0 && $$bindings.noTrailingSlash && noTrailingSlash !== void 0)
    $$bindings.noTrailingSlash(noTrailingSlash);
  if ($$props.skeleton === void 0 && $$bindings.skeleton && skeleton !== void 0)
    $$bindings.skeleton(skeleton);
  return `
${skeleton ? `${validate_component(BreadcrumbSkeleton, "BreadcrumbSkeleton").$$render($$result, Object.assign({ noTrailingSlash }, $$restProps), {}, {})}` : `<nav${spread([{ "aria-label": "Breadcrumb" }, escape_object($$restProps)])}><ol${add_classes([
    "bx--breadcrumb " + (noTrailingSlash ? "bx--breadcrumb--no-trailing-slash" : "")
  ].join(" ").trim())}>${slots.default ? slots.default({}) : ``}</ol></nav>`}`;
});
var BreadcrumbItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["href", "isCurrentPage"]);
  let { href = void 0 } = $$props;
  let { isCurrentPage = false } = $$props;
  setContext("BreadcrumbItem", {});
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.isCurrentPage === void 0 && $$bindings.isCurrentPage && isCurrentPage !== void 0)
    $$bindings.isCurrentPage(isCurrentPage);
  return `
<li${spread([escape_object($$restProps)], "bx--breadcrumb-item " + (isCurrentPage && $$restProps["aria-current"] !== "page" ? "bx--breadcrumb-item--current" : ""))}>${href ? `${validate_component(Link, "Link").$$render($$result, {
    href,
    "aria-current": $$restProps["aria-current"]
  }, {}, {
    default: () => `${slots.default ? slots.default({
      props: {
        "aria-current": $$restProps["aria-current"],
        class: "bx--link"
      }
    }) : ``}`
  })}` : `${slots.default ? slots.default({
    props: {
      "aria-current": $$restProps["aria-current"],
      class: "bx--link"
    }
  }) : ``}`}</li>`;
});
var css$4 = {
  code: ".max-width.svelte-1m23apc{max-width:600px}",
  map: `{"version":3,"file":"api-keys.svelte","sources":["api-keys.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport CodeSnippet from \\"carbon-components-svelte/src/CodeSnippet/CodeSnippet.svelte\\";\\nimport Form from \\"carbon-components-svelte/src/Form/Form.svelte\\";\\nimport InlineNotification from \\"carbon-components-svelte/src/Notification/InlineNotification.svelte\\";\\nimport TextInput from \\"carbon-components-svelte/src/TextInput/TextInput.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nimport Breadcrumb from \\"carbon-components-svelte/src/Breadcrumb/Breadcrumb.svelte\\";\\nimport BreadcrumbItem from \\"carbon-components-svelte/src/Breadcrumb/BreadcrumbItem.svelte\\";\\nimport { generateApiKey, generateApiKey$ } from '../../../store';\\nlet name;\\nfunction createApiKey() {\\n    generateApiKey.dispatch({ name });\\n    name = '';\\n}\\n<\/script>\\n\\n<div class=\\"block\\">\\n\\t<Breadcrumb noTrailingSlash>\\n\\t\\t<BreadcrumbItem href=\\"/dashboard/api\\">API Docs</BreadcrumbItem>\\n\\t\\t<BreadcrumbItem href=\\"/dashboard/api-keys\\" isCurrentPage>API Keys</BreadcrumbItem>\\n\\t</Breadcrumb>\\n</div>\\n\\n<h1>API Keys</h1>\\n\\n<div class=\\"max-width\\">\\n\\t<div class=\\"block\\">\\n\\t\\t<Tile>\\n\\t\\t\\t<h3>Generate an API Key</h3>\\n\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t<Form on:submit={createApiKey}>\\n\\t\\t\\t\\t\\t<TextInput\\n\\t\\t\\t\\t\\t\\tbind:value={name}\\n\\t\\t\\t\\t\\t\\trequired\\n\\t\\t\\t\\t\\t\\tautofocus\\n\\t\\t\\t\\t\\t\\tlabelText=\\"Name\\"\\n\\t\\t\\t\\t\\t\\tplaceholder=\\"My API Key\\"\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t\\t<br />\\n\\t\\t\\t\\t\\t<div class=\\"actions-row\\">\\n\\t\\t\\t\\t\\t\\t<Button disabled={$generateApiKey$.isLoading || !name} type=\\"submit\\"\\n\\t\\t\\t\\t\\t\\t\\t>Generate API Key</Button\\n\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</Form>\\n\\t\\t\\t</div>\\n\\t\\t</Tile>\\n\\t</div>\\n\\n\\t{#if $generateApiKey$.data}\\n\\t\\t<div class=\\"block\\">\\n\\t\\t\\t<Tile>\\n\\t\\t\\t\\t<InlineNotification\\n\\t\\t\\t\\t\\thideCloseButton\\n\\t\\t\\t\\t\\tkind=\\"warning\\"\\n\\t\\t\\t\\t\\ttitle=\\"Notice:\\"\\n\\t\\t\\t\\t\\tsubtitle=\\"This key is only shown once. Keep it secret, keep it safe!\\"\\n\\t\\t\\t\\t/>\\n\\t\\t\\t\\t<br />\\n\\t\\t\\t\\t<b>{$generateApiKey$.data.name}</b> <br />\\n\\t\\t\\t\\t<CodeSnippet skeleton={$generateApiKey$.isLoading} code={$generateApiKey$.data.apiKey} />\\n\\t\\t\\t</Tile>\\n\\t\\t</div>\\n\\t{/if}\\n</div>\\n\\n<style>\\n\\t.max-width {\\n\\t\\tmax-width: 600px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAmEC,UAAU,eAAC,CAAC,AACX,SAAS,CAAE,KAAK,AACjB,CAAC"}`
};
var Api_keys = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $generateApiKey$, $$unsubscribe_generateApiKey$;
  $$unsubscribe_generateApiKey$ = subscribe(generateApiKey$, (value) => $generateApiKey$ = value);
  let name;
  $$result.css.add(css$4);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"block"}">${validate_component(Breadcrumb, "Breadcrumb").$$render($$result, { noTrailingSlash: true }, {}, {
      default: () => `${validate_component(BreadcrumbItem, "BreadcrumbItem").$$render($$result, { href: "/dashboard/api" }, {}, { default: () => `API Docs` })}
		${validate_component(BreadcrumbItem, "BreadcrumbItem").$$render($$result, {
        href: "/dashboard/api-keys",
        isCurrentPage: true
      }, {}, { default: () => `API Keys` })}`
    })}</div>

<h1>API Keys</h1>

<div class="${"max-width svelte-1m23apc"}"><div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
      default: () => `<h3>Generate an API Key</h3>
			<div class="${"block"}">${validate_component(Form, "Form").$$render($$result, {}, {}, {
        default: () => `${validate_component(TextInput, "TextInput").$$render($$result, {
          required: true,
          autofocus: true,
          labelText: "Name",
          placeholder: "My API Key",
          value: name
        }, {
          value: ($$value) => {
            name = $$value;
            $$settled = false;
          }
        }, {})}
					<br>
					<div class="${"actions-row"}">${validate_component(Button, "Button").$$render($$result, {
          disabled: $generateApiKey$.isLoading || !name,
          type: "submit"
        }, {}, { default: () => `Generate API Key` })}</div>`
      })}</div>`
    })}</div>

	${$generateApiKey$.data ? `<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
      default: () => `${validate_component(InlineNotification, "InlineNotification").$$render($$result, {
        hideCloseButton: true,
        kind: "warning",
        title: "Notice:",
        subtitle: "This key is only shown once. Keep it secret, keep it safe!"
      }, {}, {})}
				<br>
				<b>${escape2($generateApiKey$.data.name)}</b> <br>
				${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
        skeleton: $generateApiKey$.isLoading,
        code: $generateApiKey$.data.apiKey
      }, {}, {})}`
    })}</div>` : ``}
</div>`;
  } while (!$$settled);
  $$unsubscribe_generateApiKey$();
  return $$rendered;
});
var apiKeys = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Api_keys
});
var domainResponse = {
  name: "example.com",
  ipAddresses: ["172.32.1.1", "199.4.32.1"],
  data: { tenantName: "Example Biz", customerId: "fdjai-s0sd-da-d-9fjdpm" },
  redirects: [
    { from: "/logo", to: "https://s3.amazon.com/myaccount/example-biz.png" },
    { from: "/styles", to: "https://s3.amazon.com/myaccount/example-biz-styles.css" }
  ]
};
var domainResponseRows = [
  { id: "x", fieldName: "id", type: "string", values: "" },
  { id: "a", fieldName: "name", type: "string", values: "" },
  { id: "b", fieldName: "ipAddresses", type: "Array<string>", values: "" },
  { id: "c", fieldName: "data", type: "JSON Object", values: "" },
  { id: "c1", fieldName: "type", type: "string", values: `root | subdomain` },
  { id: "cxxx", fieldName: "createdBy", type: "string", values: "a user's UUID" },
  {
    id: "c2",
    fieldName: "createdDate",
    type: "timestamp string",
    values: "yyyy-mm-ddTHH:mm:SS.sssZ"
  },
  {
    id: "c3",
    fieldName: "updatedDate",
    type: "timestamp string",
    values: "yyyy-mm-ddTHH:mm:SS.sssZ"
  },
  {
    id: "c66",
    fieldName: "deletedDate",
    type: "timestamp string",
    values: "yyyy-mm-ddTHH:mm:SS.sssZ | null"
  },
  {
    id: "d4",
    fieldName: "redirects",
    type: "Array<{from: string, to: string}>",
    values: ""
  }
];
var createDomainDocConfig = {
  title: "Create a Domain Config",
  method: "POST",
  path: ["/domain"],
  notes: [],
  requestType: "Object",
  requestRows: [
    { id: "a", fieldName: "name", type: "string", values: "", required: "Yes" },
    { id: "b", fieldName: "ipAddresses", type: "Array<string>", values: "", required: "Yes" },
    { id: "c", fieldName: "data", type: "JSON Object", values: "", required: "No" },
    {
      id: "d",
      fieldName: "redirects",
      type: "Array<{from: string, to: string}>",
      values: "",
      required: "No"
    }
  ],
  exampleRequest: domainResponse,
  responseType: "Object",
  responseRows: domainResponseRows,
  exampleResponse: {
    id: "30346048-b91f-4e38-8eef-f5fjdsl095f899b0",
    ...domainResponse,
    createdBy: "f3e31f8c-8bb0-49da-b3f0-a26dab3b019a",
    createdDate: "2021-10-07T05:44:48.995Z",
    updatedDate: "2021-10-07T05:44:48.995Z",
    deletedDate: null,
    type: "root"
  }
};
var getDomainDocConfig = {
  title: "Get a Domain Config",
  method: "GET",
  path: ["/domain/{domainName}"],
  notes: [],
  requestType: "URL",
  exampleRequest: "https://app.appmasker.com/domain/example.com",
  responseType: "Object",
  exampleResponse: {
    id: "30346048-b91f-4e38-8eef-f5fjdsl095f899b0",
    ...domainResponse,
    createdBy: "f3e31f8c-8bb0-49da-b3f0-a26dab3b019a",
    createdDate: "2021-10-07T05:44:48.995Z",
    updatedDate: "2021-10-07T05:44:48.995Z",
    deletedDate: null,
    type: "root"
  },
  responseRows: domainResponseRows
};
var editManyDomainsDocConfig = {
  title: "Update Domain Configs",
  method: "POST",
  notes: ["Note that this endpoint accepts only an array of objects."],
  path: ["/domain/update-many"],
  requestType: "Array<Object>",
  requestRows: [
    { id: "a", fieldName: "name", type: "string", values: "", required: "Yes" },
    { id: "b", fieldName: "ipAddresses", type: "Array<string>", values: "", required: "Yes" },
    { id: "c", fieldName: "data", type: "JSON Object", values: "", required: "No" },
    {
      id: "d",
      fieldName: "redirects",
      type: "Array<{from: string, to: string}>",
      values: "",
      required: "No"
    }
  ],
  exampleRequest: [domainResponse],
  responseType: "{count: number, domains: Array<Object>}",
  responseRows: domainResponseRows,
  exampleResponse: {
    count: 1,
    domains: [
      {
        id: "30346048-b91f-4e38-8eef-f5fjdsl095f899b0",
        ...domainResponse,
        createdBy: "f3e31f8c-8bb0-49da-b3f0-a26dab3b019a",
        createdDate: "2021-10-07T05:44:48.995Z",
        updatedDate: "2021-10-07T05:44:48.995Z",
        deletedDate: null,
        type: "root"
      }
    ]
  }
};
var deleteManyDomainsDocConfig = {
  title: "Delete Domains",
  method: "DELETE",
  notes: [],
  path: ["/domain/delete-many"],
  requestType: "Array<string>",
  hideTable: true,
  exampleRequest: ["example.com", "example2.com", "tenant.example3.com"],
  responseType: "None"
};
var css$3 = {
  code: ".tile-header.svelte-1tmit2c{display:flex;justify-content:space-between;flex-wrap:wrap}",
  map: `{"version":3,"file":"DocSection.svelte","sources":["DocSection.svelte"],"sourcesContent":["<script lang=\\"ts\\">import CodeSnippet from \\"carbon-components-svelte/src/CodeSnippet/CodeSnippet.svelte\\";\\nimport DataTable from \\"carbon-components-svelte/src/DataTable/DataTable.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nexport let config;\\nexport let headers = [];\\n$: responseHeaders = headers.filter((h) => h.key !== 'required');\\n<\/script>\\n\\n<Tile>\\n\\t<div class=\\"tile-header\\">\\n\\t\\t<h3>{config.title}</h3>\\n\\t\\t<code>{config.method}: {config.path.join(' or ')}</code>\\n\\t</div>\\n\\n\\t{#each config.notes as note}\\n\\t\\t<p class=\\"block\\">\\n\\t\\t\\t{note}\\n\\t\\t</p>\\n\\t{/each}\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<h4>Request</h4>\\n\\t\\t<div class=\\"block\\">\\n\\t\\t\\t<h5>Type: {config.requestType}</h5>\\n\\t\\t\\t{#if config.requestType !== 'URL' && !config.hideTable}\\n\\t\\t\\t\\t<DataTable {headers} rows={config.requestRows} />\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t\\t<div class=\\"block\\">\\n\\t\\t\\t<h5>Example Request</h5>\\n\\t\\t\\t{#if typeof config.exampleRequest === 'string'}\\n\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t<CodeSnippet type=\\"inline\\" code={config.exampleRequest} />\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{:else}\\n\\t\\t\\t\\t<CodeSnippet type=\\"multi\\" code={JSON.stringify(config.exampleRequest, null, 2)} />\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\"block\\">\\n\\t\\t\\t{#if config.responseType !== 'None'}\\n\\t\\t\\t\\t<h4>Response</h4>\\n\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t<h5>Data Type: {config.responseType}</h5>\\n\\t\\t\\t\\t\\t{#if !config.hideTable}\\n\\t\\t\\t\\t\\t\\t<DataTable headers={responseHeaders} rows={config.responseRows} />\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t<h5>Example Response</h5>\\n\\t\\t\\t\\t\\t{#if typeof config.exampleResponse === 'string'}\\n\\t\\t\\t\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t\\t\\t\\t<CodeSnippet type=\\"inline\\" code={config.exampleResponse} />\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t<CodeSnippet type=\\"multi\\" code={JSON.stringify(config.exampleResponse, null, 2)} />\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t</div></Tile\\n>\\n\\n<style>\\n\\t.tile-header {\\n\\t\\tdisplay: flex;\\n\\t\\tjustify-content: space-between;\\n\\t\\tflex-wrap: wrap;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAgEC,YAAY,eAAC,CAAC,AACb,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,SAAS,CAAE,IAAI,AAChB,CAAC"}`
};
var DocSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let responseHeaders;
  let { config } = $$props;
  let { headers = [] } = $$props;
  if ($$props.config === void 0 && $$bindings.config && config !== void 0)
    $$bindings.config(config);
  if ($$props.headers === void 0 && $$bindings.headers && headers !== void 0)
    $$bindings.headers(headers);
  $$result.css.add(css$3);
  responseHeaders = headers.filter((h) => h.key !== "required");
  return `${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<div class="${"tile-header svelte-1tmit2c"}"><h3>${escape2(config.title)}</h3>
		<code>${escape2(config.method)}: ${escape2(config.path.join(" or "))}</code></div>

	${each(config.notes, (note) => `<p class="${"block"}">${escape2(note)}
		</p>`)}

	<div class="${"block"}"><h4>Request</h4>
		<div class="${"block"}"><h5>Type: ${escape2(config.requestType)}</h5>
			${config.requestType !== "URL" && !config.hideTable ? `${validate_component(DataTable, "DataTable").$$render($$result, { headers, rows: config.requestRows }, {}, {})}` : ``}</div>
		<div class="${"block"}"><h5>Example Request</h5>
			${typeof config.exampleRequest === "string" ? `<div class="${"block"}">${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
      type: "inline",
      code: config.exampleRequest
    }, {}, {})}</div>` : `${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
      type: "multi",
      code: JSON.stringify(config.exampleRequest, null, 2)
    }, {}, {})}`}</div>

		<div class="${"block"}">${config.responseType !== "None" ? `<h4>Response</h4>
				<div class="${"block"}"><h5>Data Type: ${escape2(config.responseType)}</h5>
					${!config.hideTable ? `${validate_component(DataTable, "DataTable").$$render($$result, {
      headers: responseHeaders,
      rows: config.responseRows
    }, {}, {})}` : ``}</div>
				<div class="${"block"}"><h5>Example Response</h5>
					${typeof config.exampleResponse === "string" ? `<div class="${"block"}">${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
      type: "inline",
      code: config.exampleResponse
    }, {}, {})}</div>` : `${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
      type: "multi",
      code: JSON.stringify(config.exampleResponse, null, 2)
    }, {}, {})}`}</div>` : ``}</div></div>`
  })}`;
});
var css$2 = {
  code: ".api-docs-container.svelte-1v6qohn{max-width:1200px}.top-bar.svelte-1v6qohn{width:100%;display:flex;flex-wrap:wrap;justify-content:space-between}",
  map: `{"version":3,"file":"docs.svelte","sources":["docs.svelte"],"sourcesContent":["<script>\\n\\timport Tabs from \\"carbon-components-svelte/src/Tabs/Tabs.svelte\\";\\nimport Tab from \\"carbon-components-svelte/src/Tabs/Tab.svelte\\";\\nimport TabContent from \\"carbon-components-svelte/src/Tabs/TabContent.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nimport Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Link from \\"carbon-components-svelte/src/Link/Link.svelte\\";\\nimport CodeSnippet from \\"carbon-components-svelte/src/CodeSnippet/CodeSnippet.svelte\\";\\nimport DataTable from \\"carbon-components-svelte/src/DataTable/DataTable.svelte\\";\\n\\timport {\\n\\t\\tcreateDomainDocConfig,\\n\\t\\tdeleteManyDomainsDocConfig,\\n\\t\\teditManyDomainsDocConfig,\\n\\t\\tgetDomainDocConfig\\n\\t} from '../../../utils/docs';\\n\\timport DocSection from '../../../components/DocSection.svelte';\\n\\n\\tconst tableHeaders = [\\n\\t\\t{ key: 'fieldName', value: 'Field Name' },\\n\\t\\t{ key: 'type', value: 'Type' },\\n\\t\\t{ key: 'values', value: 'Values' },\\n\\t\\t{ key: 'required', value: 'Required' }\\n\\t];\\n<\/script>\\n\\n<div class=\\"api-docs-container\\">\\n\\t<div class=\\"top-bar\\">\\n\\t\\t<h1>API Documentation</h1>\\n\\t\\t<Button href=\\"/dashboard/api/api-keys\\">Generate API Key</Button>\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<Tile>\\n\\t\\t\\t<h3>Introduction</h3>\\n\\t\\t\\t<p class=\\"block\\">\\n\\t\\t\\t\\tAppMasker uses a simple REST API for programatic configuration. API's are available at <CodeSnippet\\n\\t\\t\\t\\t\\ttype=\\"inline\\">https://app.appmasker.com</CodeSnippet\\n\\t\\t\\t\\t>. For example, if you wanted to create a domain, the url would be a <code>POST</code> call\\n\\t\\t\\t\\tto\\n\\t\\t\\t\\t<CodeSnippet type=\\"inline\\">https://app.appmasker.com/domain</CodeSnippet>.\\n\\t\\t\\t</p>\\n\\t\\t\\t<h4>Response Payloads</h4>\\n\\t\\t\\t<p>All response payloads are JSON objects with the following structure:</p>\\n\\n\\t\\t\\t<CodeSnippet\\n\\t\\t\\t\\ttype=\\"multi\\"\\n\\t\\t\\t\\tlight={false}\\n\\t\\t\\t\\tcode={JSON.stringify(\\n\\t\\t\\t\\t\\t{ data: 'Object | Array', message: 'string', errors: 'Array' },\\n\\t\\t\\t\\t\\tnull,\\n\\t\\t\\t\\t\\t2\\n\\t\\t\\t\\t)}\\n\\t\\t\\t/>\\n\\n\\t\\t\\t<p>\\n\\t\\t\\t\\tThe type signature of the objects and arrays will depend on which endpoint you're calling.\\n\\t\\t\\t</p>\\n\\t\\t</Tile>\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<Tile>\\n\\t\\t\\t<h3>Authentication</h3>\\n\\t\\t\\t<p class=\\"block\\">\\n\\t\\t\\t\\tAll endpoints require an API Key to authenticate. <a href=\\"/dashboard/api/api-keys\\"\\n\\t\\t\\t\\t\\t>You can create one here</a\\n\\t\\t\\t\\t>. Set the <CodeSnippet type=\\"inline\\" code=\\"x-api-key\\" /> HTTP header with your generated token.\\n\\t\\t\\t</p>\\n\\n\\t\\t\\t<div class=\\"block\\">\\n\\t\\t\\t\\t<h4>API Key safety</h4>\\n\\t\\t\\t\\t<p>\\n\\t\\t\\t\\t\\tDo not share the API Key or expose it in a web client. Keep it safe on your backend\\n\\t\\t\\t\\t\\tserver. Have your client code request these endpoints through your server or add the\\n\\t\\t\\t\\t\\taforementioned header through a proxy.\\n\\t\\t\\t\\t</p>\\n\\t\\t\\t</div>\\n\\t\\t</Tile>\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<DocSection config={createDomainDocConfig} headers={tableHeaders} />\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<DocSection config={getDomainDocConfig} headers={tableHeaders} />\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<DocSection config={editManyDomainsDocConfig} headers={tableHeaders} />\\n\\t</div>\\n\\n\\t<div class=\\"block\\">\\n\\t\\t<DocSection config={deleteManyDomainsDocConfig} headers={tableHeaders} />\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.api-docs-container {\\n\\t\\tmax-width: 1200px;\\n\\t}\\n\\t.top-bar {\\n\\t\\twidth: 100%;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-wrap: wrap;\\n\\t\\tjustify-content: space-between;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAkGC,mBAAmB,eAAC,CAAC,AACpB,SAAS,CAAE,MAAM,AAClB,CAAC,AACD,QAAQ,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CACf,eAAe,CAAE,aAAa,AAC/B,CAAC"}`
};
var Docs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const tableHeaders = [
    { key: "fieldName", value: "Field Name" },
    { key: "type", value: "Type" },
    { key: "values", value: "Values" },
    { key: "required", value: "Required" }
  ];
  $$result.css.add(css$2);
  return `<div class="${"api-docs-container svelte-1v6qohn"}"><div class="${"top-bar svelte-1v6qohn"}"><h1>API Documentation</h1>
		${validate_component(Button, "Button").$$render($$result, { href: "/dashboard/api/api-keys" }, {}, { default: () => `Generate API Key` })}</div>

	<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<h3>Introduction</h3>
			<p class="${"block"}">AppMasker uses a simple REST API for programatic configuration. API&#39;s are available at ${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, { type: "inline" }, {}, {
      default: () => `https://app.appmasker.com`
    })}. For example, if you wanted to create a domain, the url would be a <code>POST</code> call
				to
				${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, { type: "inline" }, {}, {
      default: () => `https://app.appmasker.com/domain`
    })}.
			</p>
			<h4>Response Payloads</h4>
			<p>All response payloads are JSON objects with the following structure:</p>

			${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, {
      type: "multi",
      light: false,
      code: JSON.stringify({
        data: "Object | Array",
        message: "string",
        errors: "Array"
      }, null, 2)
    }, {}, {})}

			<p>The type signature of the objects and arrays will depend on which endpoint you&#39;re calling.
			</p>`
  })}</div>

	<div class="${"block"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
    default: () => `<h3>Authentication</h3>
			<p class="${"block"}">All endpoints require an API Key to authenticate. <a href="${"/dashboard/api/api-keys"}">You can create one here</a>. Set the ${validate_component(CodeSnippet, "CodeSnippet").$$render($$result, { type: "inline", code: "x-api-key" }, {}, {})} HTTP header with your generated token.
			</p>

			<div class="${"block"}"><h4>API Key safety</h4>
				<p>Do not share the API Key or expose it in a web client. Keep it safe on your backend
					server. Have your client code request these endpoints through your server or add the
					aforementioned header through a proxy.
				</p></div>`
  })}</div>

	<div class="${"block"}">${validate_component(DocSection, "DocSection").$$render($$result, {
    config: createDomainDocConfig,
    headers: tableHeaders
  }, {}, {})}</div>

	<div class="${"block"}">${validate_component(DocSection, "DocSection").$$render($$result, {
    config: getDomainDocConfig,
    headers: tableHeaders
  }, {}, {})}</div>

	<div class="${"block"}">${validate_component(DocSection, "DocSection").$$render($$result, {
    config: editManyDomainsDocConfig,
    headers: tableHeaders
  }, {}, {})}</div>

	<div class="${"block"}">${validate_component(DocSection, "DocSection").$$render($$result, {
    config: deleteManyDomainsDocConfig,
    headers: tableHeaders
  }, {}, {})}</div>
</div>`;
});
var docs = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Docs
});
var View16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "View16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M15.5,7.8C14.3,4.7,11.3,2.6,8,2.5C4.7,2.6,1.7,4.7,0.5,7.8c0,0.1,0,0.2,0,0.3c1.2,3.1,4.1,5.2,7.5,5.3	c3.3-0.1,6.3-2.2,7.5-5.3C15.5,8.1,15.5,7.9,15.5,7.8z M8,12.5c-2.7,0-5.4-2-6.5-4.5c1-2.5,3.8-4.5,6.5-4.5s5.4,2,6.5,4.5	C13.4,10.5,10.6,12.5,8,12.5z"}"></path><path d="${"M8,5C6.3,5,5,6.3,5,8s1.3,3,3,3s3-1.3,3-3S9.7,5,8,5z M8,10c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S9.1,10,8,10z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var ViewOff16 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ariaLabel;
  let ariaLabelledBy;
  let labelled;
  let attributes;
  let { class: className = void 0 } = $$props;
  let { id = void 0 } = $$props;
  let { tabindex = void 0 } = $$props;
  let { focusable = false } = $$props;
  let { title = void 0 } = $$props;
  let { style = void 0 } = $$props;
  if ($$props.class === void 0 && $$bindings.class && className !== void 0)
    $$bindings.class(className);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.tabindex === void 0 && $$bindings.tabindex && tabindex !== void 0)
    $$bindings.tabindex(tabindex);
  if ($$props.focusable === void 0 && $$bindings.focusable && focusable !== void 0)
    $$bindings.focusable(focusable);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  ariaLabel = $$props["aria-label"];
  ariaLabelledBy = $$props["aria-labelledby"];
  labelled = ariaLabel || ariaLabelledBy || title;
  attributes = {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-hidden": labelled ? void 0 : true,
    role: labelled ? "img" : void 0,
    focusable: tabindex === "0" ? true : focusable,
    tabindex
  };
  return `
<svg${spread([
    { "data-carbon-icon": "ViewOff16" },
    { xmlns: "http://www.w3.org/2000/svg" },
    { viewBox: "0 0 16 16" },
    { fill: "currentColor" },
    { width: "16" },
    { height: "16" },
    { class: escape_attribute_value(className) },
    { preserveAspectRatio: "xMidYMid meet" },
    { style: escape_attribute_value(style) },
    { id: escape_attribute_value(id) },
    escape_object(attributes)
  ])}><path d="${"M2.6,11.3l0.7-0.7C2.6,9.8,1.9,9,1.5,8c1-2.5,3.8-4.5,6.5-4.5c0.7,0,1.4,0.1,2,0.4l0.8-0.8C9.9,2.7,9,2.5,8,2.5	C4.7,2.6,1.7,4.7,0.5,7.8c0,0.1,0,0.2,0,0.3C1,9.3,1.7,10.4,2.6,11.3z"}"></path><path d="${"M6 7.9c.1-1 .9-1.8 1.8-1.8l.9-.9C7.2 4.7 5.5 5.6 5.1 7.2 5 7.7 5 8.3 5.1 8.8L6 7.9zM15.5 7.8c-.6-1.5-1.6-2.8-2.9-3.7L15 1.7 14.3 1 1 14.3 1.7 15l2.6-2.6c1.1.7 2.4 1 3.7 1.1 3.3-.1 6.3-2.2 7.5-5.3C15.5 8.1 15.5 7.9 15.5 7.8zM10 8c0 1.1-.9 2-2 2-.3 0-.7-.1-1-.3L9.7 7C9.9 7.3 10 7.6 10 8zM8 12.5c-1 0-2.1-.3-3-.8l1.3-1.3c1.4.9 3.2.6 4.2-.8.7-1 .7-2.4 0-3.4l1.4-1.4c1.1.8 2 1.9 2.6 3.2C13.4 10.5 10.6 12.5 8 12.5z"}"></path>${slots.default ? slots.default({}) : `
    ${title ? `<title>${escape2(title)}</title>` : ``}
  `}</svg>`;
});
var PasswordInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isFluid;
  let errorId;
  let warnId;
  let $$restProps = compute_rest_props($$props, [
    "size",
    "value",
    "type",
    "placeholder",
    "hidePasswordLabel",
    "showPasswordLabel",
    "tooltipAlignment",
    "tooltipPosition",
    "light",
    "disabled",
    "helperText",
    "labelText",
    "hideLabel",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "inline",
    "id",
    "name",
    "ref"
  ]);
  let { size = void 0 } = $$props;
  let { value = "" } = $$props;
  let { type = "password" } = $$props;
  let { placeholder = "" } = $$props;
  let { hidePasswordLabel = "Hide password" } = $$props;
  let { showPasswordLabel = "Show password" } = $$props;
  let { tooltipAlignment = "center" } = $$props;
  let { tooltipPosition = "bottom" } = $$props;
  let { light = false } = $$props;
  let { disabled = false } = $$props;
  let { helperText = "" } = $$props;
  let { labelText = "" } = $$props;
  let { hideLabel = false } = $$props;
  let { invalid = false } = $$props;
  let { invalidText = "" } = $$props;
  let { warn = false } = $$props;
  let { warnText = "" } = $$props;
  let { inline = false } = $$props;
  let { id = "ccs-" + Math.random().toString(36) } = $$props;
  let { name = void 0 } = $$props;
  let { ref = null } = $$props;
  const ctx = getContext("Form");
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.hidePasswordLabel === void 0 && $$bindings.hidePasswordLabel && hidePasswordLabel !== void 0)
    $$bindings.hidePasswordLabel(hidePasswordLabel);
  if ($$props.showPasswordLabel === void 0 && $$bindings.showPasswordLabel && showPasswordLabel !== void 0)
    $$bindings.showPasswordLabel(showPasswordLabel);
  if ($$props.tooltipAlignment === void 0 && $$bindings.tooltipAlignment && tooltipAlignment !== void 0)
    $$bindings.tooltipAlignment(tooltipAlignment);
  if ($$props.tooltipPosition === void 0 && $$bindings.tooltipPosition && tooltipPosition !== void 0)
    $$bindings.tooltipPosition(tooltipPosition);
  if ($$props.light === void 0 && $$bindings.light && light !== void 0)
    $$bindings.light(light);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.helperText === void 0 && $$bindings.helperText && helperText !== void 0)
    $$bindings.helperText(helperText);
  if ($$props.labelText === void 0 && $$bindings.labelText && labelText !== void 0)
    $$bindings.labelText(labelText);
  if ($$props.hideLabel === void 0 && $$bindings.hideLabel && hideLabel !== void 0)
    $$bindings.hideLabel(hideLabel);
  if ($$props.invalid === void 0 && $$bindings.invalid && invalid !== void 0)
    $$bindings.invalid(invalid);
  if ($$props.invalidText === void 0 && $$bindings.invalidText && invalidText !== void 0)
    $$bindings.invalidText(invalidText);
  if ($$props.warn === void 0 && $$bindings.warn && warn !== void 0)
    $$bindings.warn(warn);
  if ($$props.warnText === void 0 && $$bindings.warnText && warnText !== void 0)
    $$bindings.warnText(warnText);
  if ($$props.inline === void 0 && $$bindings.inline && inline !== void 0)
    $$bindings.inline(inline);
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.ref === void 0 && $$bindings.ref && ref !== void 0)
    $$bindings.ref(ref);
  isFluid = !!ctx && ctx.isFluid;
  errorId = `error-${id}`;
  warnId = `warn-${id}`;
  return `
<div${add_classes([
    "bx--form-item bx--text-input-wrapper " + (!isFluid ? "bx--password-input-wrapper" : "") + " " + (light ? "bx--text-input-wrapper--light" : "") + " " + (inline ? "bx--text-input-wrapper--inline" : "")
  ].join(" ").trim())}>${inline ? `<label${add_attribute("for", id, 0)}${add_classes([
    "bx--label " + (hideLabel ? "bx--visually-hidden" : "") + " " + (disabled ? "bx--label--disabled" : "") + " " + (inline ? "bx--label--inline" : "") + " " + (inline && size === "sm" ? "bx--label--inline--sm" : "") + " " + (inline && size === "xl" ? "bx--label--inline--xl" : "")
  ].join(" ").trim())}>${slots.labelText ? slots.labelText({}) : `
        ${escape2(labelText)}
      `}</label>
    ${!isFluid && helperText ? `<div${add_classes([
    "bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "") + " " + (inline ? "bx--form__helper-text--inline" : "")
  ].join(" ").trim())}>${escape2(helperText)}</div>` : ``}` : `<label${add_attribute("for", id, 0)}${add_classes([
    "bx--label " + (hideLabel ? "bx--visually-hidden" : "") + " " + (disabled ? "bx--label--disabled" : "") + " " + (inline ? "bx--label--inline" : "") + " " + (inline && size === "sm" ? "bx--label--inline--sm" : "") + " " + (inline && size === "xl" ? "bx--label--inline--xl" : "")
  ].join(" ").trim())}>${slots.labelText ? slots.labelText({}) : `
        ${escape2(labelText)}
      `}</label>`}
  <div${add_classes([
    "bx--text-input__field-outer-wrapper " + (inline ? "bx--text-input__field-outer-wrapper--inline" : "")
  ].join(" ").trim())}><div${add_attribute("data-invalid", invalid || void 0, 0)}${add_classes([
    "bx--text-input__field-wrapper " + (warn ? "bx--text-input__field-wrapper--warning" : "")
  ].join(" ").trim())}>${invalid ? `${validate_component(WarningFilled16, "WarningFilled16").$$render($$result, { class: "bx--text-input__invalid-icon" }, {}, {})}` : ``}
      ${!invalid && warn ? `${validate_component(WarningAltFilled16, "WarningAltFilled16").$$render($$result, {
    class: "bx--text-input__invalid-icon\n            bx--text-input__invalid-icon--warning"
  }, {}, {})}` : ``}
      <input${spread([
    {
      "data-invalid": escape_attribute_value(invalid || void 0)
    },
    {
      "aria-invalid": escape_attribute_value(invalid || void 0)
    },
    {
      "aria-describedby": escape_attribute_value(invalid ? errorId : warn ? warnId : void 0)
    },
    { id: escape_attribute_value(id) },
    { name: escape_attribute_value(name) },
    {
      placeholder: escape_attribute_value(placeholder)
    },
    { type: escape_attribute_value(type) },
    { value: escape_attribute_value(value) },
    { disabled: disabled || null },
    escape_object($$restProps),
    {
      class: escape_attribute_value(size && `bx--text-input--${size}`)
    }
  ], "bx--text-input bx--password-input " + (light ? "bx--text-input--light" : "") + " " + (invalid ? "bx--text-input--invalid" : "") + " " + (warn ? "bx--text-input--warning" : ""))}${add_attribute("this", ref, 0)}>
      <button type="${"button"}" ${disabled ? "disabled" : ""} class="${[
    escape2(tooltipPosition && `bx--tooltip--${tooltipPosition}`) + " " + escape2(tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`),
    "bx--text-input--password__visibility__toggle bx--btn bx--btn--icon-only " + (disabled ? "bx--btn--disabled" : "") + " bx--tooltip__trigger bx--tooltip--a11y"
  ].join(" ").trim()}">${!disabled ? `<span${add_classes(["bx--assistive-text"].join(" ").trim())}>${type === "text" ? `${escape2(hidePasswordLabel)}` : `${escape2(showPasswordLabel)}`}</span>` : ``}
        ${type === "text" ? `${validate_component(ViewOff16, "ViewOff16").$$render($$result, { class: "bx--icon-visibility-off" }, {}, {})}` : `${validate_component(View16, "View16").$$render($$result, { class: "bx--icon-visibility-on" }, {}, {})}`}</button></div>
    ${!isFluid && invalid ? `<div${add_attribute("id", errorId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(invalidText)}</div>` : ``}
    ${!invalid && !warn && !isFluid && !inline ? `<div${add_classes([
    "bx--form__helper-text " + (disabled ? "bx--form__helper-text--disabled" : "") + " " + (inline ? "bx--form__helper-text--inline" : "")
  ].join(" ").trim())}>${escape2(helperText)}</div>` : ``}
    ${!isFluid && !invalid && warn ? `<div${add_attribute("id", warnId, 0)}${add_classes(["bx--form-requirement"].join(" ").trim())}>${escape2(warnText)}</div>` : ``}</div></div>`;
});
var css$1 = {
  code: ".auth-container.svelte-q65tk9{margin:2em auto;max-width:400px}",
  map: `{"version":3,"file":"signup.svelte","sources":["signup.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { goto } from '$app/navigation';\\nimport Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Form from \\"carbon-components-svelte/src/Form/Form.svelte\\";\\nimport Link from \\"carbon-components-svelte/src/Link/Link.svelte\\";\\nimport PasswordInput from \\"carbon-components-svelte/src/TextInput/PasswordInput.svelte\\";\\nimport TextInput from \\"carbon-components-svelte/src/TextInput/TextInput.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nimport { showNotification$ } from '../../store';\\nimport { backendCall } from '../../api';\\nlet email;\\nlet password;\\nfunction onSubmit() {\\n    // signIn.dispatch({ email, password });\\n    backendCall('/auth/signup', 'POST', {\\n        email,\\n        password\\n    })\\n        .then((result) => {\\n        goto('/');\\n    })\\n        .catch((err) => {\\n        showNotification$.set({ message: err.message, title: 'Registration Failed' });\\n    });\\n}\\n<\/script>\\n\\n<div class=\\"auth-container\\">\\n\\t<Tile>\\n\\t\\t<Form on:submit={onSubmit}>\\n\\t\\t\\t<TextInput\\n\\t\\t\\t\\tbind:value={email}\\n\\t\\t\\t\\ttype=\\"email\\"\\n\\t\\t\\t\\tplaceholder=\\"your@email.com\\"\\n\\t\\t\\t\\tautofocus\\n\\t\\t\\t\\trequired\\n\\t\\t\\t\\tlabelText=\\"Email\\"\\n\\t\\t\\t/>\\n\\t\\t\\t<PasswordInput\\n\\t\\t\\t\\tbind:value={password}\\n\\t\\t\\t\\trequired\\n\\t\\t\\t\\tplaceholder=\\"create a password\\"\\n\\t\\t\\t\\tlabelText=\\"Password\\"\\n\\t\\t\\t/>\\n\\t\\t\\t<div class=\\"actions-row\\">\\n\\t\\t\\t\\t<Button type=\\"submit\\">Sign Up</Button>\\n\\t\\t\\t\\t<Link kind=\\"tertiary\\" href=\\"/auth/login\\">Log In</Link>\\n\\t\\t\\t</div>\\n\\t\\t</Form>\\n\\t</Tile>\\n</div>\\n\\n<style>\\n\\t.auth-container {\\n\\t\\tmargin: 2em auto;\\n\\t\\tmax-width: 400px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAoDC,eAAe,cAAC,CAAC,AAChB,MAAM,CAAE,GAAG,CAAC,IAAI,CAChB,SAAS,CAAE,KAAK,AACjB,CAAC"}`
};
var Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email;
  let password;
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"auth-container svelte-q65tk9"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
      default: () => `${validate_component(Form, "Form").$$render($$result, {}, {}, {
        default: () => `${validate_component(TextInput, "TextInput").$$render($$result, {
          type: "email",
          placeholder: "your@email.com",
          autofocus: true,
          required: true,
          labelText: "Email",
          value: email
        }, {
          value: ($$value) => {
            email = $$value;
            $$settled = false;
          }
        }, {})}
			${validate_component(PasswordInput, "PasswordInput").$$render($$result, {
          required: true,
          placeholder: "create a password",
          labelText: "Password",
          value: password
        }, {
          value: ($$value) => {
            password = $$value;
            $$settled = false;
          }
        }, {})}
			<div class="${"actions-row"}">${validate_component(Button, "Button").$$render($$result, { type: "submit" }, {}, { default: () => `Sign Up` })}
				${validate_component(Link, "Link").$$render($$result, { kind: "tertiary", href: "/auth/login" }, {}, { default: () => `Log In` })}</div>`
      })}`
    })}
</div>`;
  } while (!$$settled);
  return $$rendered;
});
var signup = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup
});
var css = {
  code: ".auth-container.svelte-q65tk9{margin:2em auto;max-width:400px}",
  map: `{"version":3,"file":"login.svelte","sources":["login.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { goto } from '$app/navigation';\\nimport Button from \\"carbon-components-svelte/src/Button/Button.svelte\\";\\nimport Form from \\"carbon-components-svelte/src/Form/Form.svelte\\";\\nimport Link from \\"carbon-components-svelte/src/Link/Link.svelte\\";\\nimport PasswordInput from \\"carbon-components-svelte/src/TextInput/PasswordInput.svelte\\";\\nimport TextInput from \\"carbon-components-svelte/src/TextInput/TextInput.svelte\\";\\nimport Tile from \\"carbon-components-svelte/src/Tile/Tile.svelte\\";\\nimport { showNotification$ } from '../../store';\\nimport { backendCall } from '../../api';\\nlet email;\\nlet password;\\nfunction onSubmit() {\\n    // signIn.dispatch({ email, password });\\n    backendCall('/auth/login', 'POST', {\\n        email,\\n        password\\n    })\\n        .then((result) => {\\n        goto('/');\\n    })\\n        .catch((err) => {\\n        showNotification$.set({\\n            message: (err === null || err === void 0 ? void 0 : err.message) || 'Make sure your credentials are correct',\\n            title: 'Login Failed'\\n        });\\n    });\\n}\\n<\/script>\\n\\n<div class=\\"auth-container\\">\\n\\t<Tile>\\n\\t\\t<Form on:submit={onSubmit}>\\n\\t\\t\\t<TextInput bind:value={email} required type=\\"email\\" autofocus labelText=\\"Email\\" />\\n\\t\\t\\t<PasswordInput bind:value={password} required labelText=\\"Password\\" />\\n\\t\\t\\t<div class=\\"actions-row\\">\\n\\t\\t\\t\\t<Button type=\\"submit\\">Log In</Button>\\n\\t\\t\\t\\t<Link kind=\\"tertiary\\" href=\\"/auth/signup\\">Register</Link>\\n\\t\\t\\t</div>\\n\\t\\t</Form>\\n\\t</Tile>\\n</div>\\n\\n<style>\\n\\t.auth-container {\\n\\t\\tmargin: 2em auto;\\n\\t\\tmax-width: 400px;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA2CC,eAAe,cAAC,CAAC,AAChB,MAAM,CAAE,GAAG,CAAC,IAAI,CAChB,SAAS,CAAE,KAAK,AACjB,CAAC"}`
};
var Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email;
  let password;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="${"auth-container svelte-q65tk9"}">${validate_component(Tile, "Tile").$$render($$result, {}, {}, {
      default: () => `${validate_component(Form, "Form").$$render($$result, {}, {}, {
        default: () => `${validate_component(TextInput, "TextInput").$$render($$result, {
          required: true,
          type: "email",
          autofocus: true,
          labelText: "Email",
          value: email
        }, {
          value: ($$value) => {
            email = $$value;
            $$settled = false;
          }
        }, {})}
			${validate_component(PasswordInput, "PasswordInput").$$render($$result, {
          required: true,
          labelText: "Password",
          value: password
        }, {
          value: ($$value) => {
            password = $$value;
            $$settled = false;
          }
        }, {})}
			<div class="${"actions-row"}">${validate_component(Button, "Button").$$render($$result, { type: "submit" }, {}, { default: () => `Log In` })}
				${validate_component(Link, "Link").$$render($$result, { kind: "tertiary", href: "/auth/signup" }, {}, { default: () => `Register` })}</div>`
      })}`
    })}
</div>`;
  } while (!$$settled);
  return $$rendered;
});
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

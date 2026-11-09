#!/usr/bin/env python3
"""
Convert a Google Docs API JSON export of a "This Won't Save Us" election guide
into Sanity-shaped seed documents.

Usage:
  python3 scripts/gdoc-to-seed.py <doc.json> <election-slug> <YYYY-MM-DD> > src/content/seed/<slug>.json

The output is a JSON array of documents (_id, _type, ...) that can be read
directly by the app's local content layer or imported into Sanity with
`npm run seed:import`.
"""
import json
import re
import sys
import hashlib
import unicodedata

if len(sys.argv) < 4:
    sys.exit(__doc__)

SRC, SLUG, DATE = sys.argv[1], sys.argv[2], sys.argv[3]

doc = json.load(open(SRC))
if "content" in doc:
    doc = doc["content"]
body = doc["tabs"][0]["documentTab"]["body"]["content"]

CATEGORY_BY_H1 = {
    "federal elections": "federal",
    "state elections": "state",
    "jackson county": "county",
    "city": "city",
    "kansas city": "city",
    "schools": "schools",
    "school board": "schools",
    "judges": "judges",
    "ballot questions": "ballot",
}
LABELS = {
    "the job description": "job",
    "job description": "job",
    "job descriptions": "job",
    "the candidates:": "candidates",
    "the candidate:": "candidates",
    "candidates:": "candidates",
    "the candidates": "candidates",
    "the dem:": "candidates",
    "the dems:": "candidates",
    "the democrat:": "candidates",
    "candidate:": "candidates",
    "deep dive": "deep",
    "ballot language": "ballot",
    "who's behind it?": "behind",
    "who’s behind it?": "behind",
}
PARTY = {
    "r": "R", "d": "D", "l": "L", "g": "G", "i": "I",
    "republican": "R", "democrat": "D", "libertarian": "L", "green": "G", "independent": "I",
}


def key(*parts):
    return hashlib.md5("|".join(str(p) for p in parts).encode()).hexdigest()[:12]


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def para_text(p):
    return "".join(r.get("textRun", {}).get("content", "") for r in p.get("elements", [])).strip()


def para_style(p):
    return p.get("paragraphStyle", {}).get("namedStyleType", "NORMAL_TEXT")


def heading_level(p):
    st = para_style(p)
    m = re.match(r"HEADING_(\d)", st)
    return int(m.group(1)) if m else None


def label_of(p):
    t = para_text(p).lower().rstrip(":").strip()
    for k, v in LABELS.items():
        if t == k.rstrip(":"):
            return v
    return None


def to_block(p, idx, style_override=None):
    """Google Docs paragraph -> Portable Text block (or None if empty)."""
    children, mark_defs = [], []
    for r in p.get("elements", []):
        tr = r.get("textRun")
        if not tr:
            continue
        text = tr["content"].replace("\n", "")
        if not text:
            continue
        ts = tr.get("textStyle", {})
        marks = []
        if ts.get("bold"):
            marks.append("strong")
        if ts.get("italic"):
            marks.append("em")
        link = ts.get("link", {}).get("url")
        if link:
            k = key("link", idx, link, len(mark_defs))
            mark_defs.append({"_key": k, "_type": "link", "href": link})
            marks.append(k)
        # Merge with previous span when marks match
        if children and children[-1]["marks"] == marks:
            children[-1]["text"] += text
        else:
            children.append({"_type": "span", "_key": key("span", idx, len(children)), "text": text, "marks": marks})
    full = "".join(c["text"] for c in children)
    if not full.strip():
        return None
    # trim leading/trailing whitespace on edges
    children[0]["text"] = children[0]["text"].lstrip()
    children[-1]["text"] = children[-1]["text"].rstrip()
    children = [c for c in children if c["text"] != ""]
    # Drop the label-only "bold" when the whole paragraph is a single bold line we didn't strip
    block = {
        "_type": "block",
        "_key": key("block", idx),
        "style": style_override or "normal",
        "markDefs": mark_defs,
        "children": children,
    }
    lvl = heading_level(p)
    if lvl and not style_override:
        block["style"] = f"h{min(lvl + 1, 6)}"  # demote: doc H4 inside an item -> h5? keep h4 for readability
        block["style"] = "h4"
    if "bullet" in p:
        block["listItem"] = "bullet"
        block["level"] = p["bullet"].get("nestingLevel", 0) + 1
    return block


def _heading_para(text):
    return {"paragraphStyle": {"namedStyleType": "HEADING_4"}, "elements": [{"textRun": {"content": text, "textStyle": {}}}]}


def blocks(paras, start_idx=0):
    out = []
    for i, p in enumerate(paras):
        b = to_block(p, f"{start_idx}-{i}")
        if b:
            out.append(b)
    return out


# ---------------------------------------------------------------------------
# Collect paragraphs (ignore tables / TOC)
paras = [e["paragraph"] for e in body if "paragraph" in e]

# Title / subtitle / preamble (before first H1)
title_lines, subtitle_lines, preamble = [], [], []
first_h1 = next(i for i, p in enumerate(paras) if heading_level(p) == 1)
for p in paras[:first_h1]:
    st = para_style(p)
    t = para_text(p)
    if not t:
        continue
    if st == "TITLE":
        title_lines.append(t)
    elif st == "SUBTITLE":
        subtitle_lines.append(t)
    else:
        preamble.append(p)

share_link = None
for p in preamble:
    for r in p.get("elements", []):
        url = r.get("textRun", {}).get("textStyle", {}).get("link", {}).get("url")
        if url and "bit.ly" in url:
            share_link = url

# Split into H1 groups
groups = []
cur = None
for p in paras[first_h1:]:
    if heading_level(p) == 1:
        cur = {"title": para_text(p), "paras": []}
        groups.append(cur)
    else:
        cur["paras"].append(p)


def split_by_heading(plist, level):
    """-> (lead_paras, [ {title, paras} ])"""
    lead, items, cur = [], [], None
    for p in plist:
        if heading_level(p) == level:
            if not para_text(p):
                continue
            cur = {"title": para_text(p), "paras": []}
            items.append(cur)
        elif cur is None:
            lead.append(p)
        else:
            cur["paras"].append(p)
    return lead, items


def split_by_labels(plist):
    """Split a body on bold label lines -> dict(label -> paras), 'lead' for text before any label."""
    parts, cur = {"lead": []}, "lead"
    for p in plist:
        lab = label_of(p)
        if lab:
            cur = lab
            parts.setdefault(cur, [])
            continue
        if not para_text(p):
            continue
        parts.setdefault(cur, []).append(p)
    return parts


def parse_candidates(plist):
    out = []
    for p in plist:
        t = para_text(p)
        if not t:
            continue
        m = re.match(r"^(.*?)\s*\(([^)]*)\)\s*$", t)
        name, party, write_in, note = t, None, False, None
        if m:
            name, raw = m.group(1).strip(), m.group(2).strip()
            low = raw.lower()
            if "write-in" in low or "write in" in low:
                write_in = True
            if "no party" in low or "unaffiliated" in low or "nonpartisan" in low:
                party = "NP"
            else:
                party = PARTY.get(low.split(",")[0].strip(), None)
            if party is None and not write_in:
                note = raw
        website = None
        for r in p.get("elements", []):
            url = r.get("textRun", {}).get("textStyle", {}).get("link", {}).get("url")
            if url:
                website = url
        c = {"_type": "candidate", "_key": key("cand", SLUG, name), "name": name}
        if party:
            c["party"] = party
        if write_in:
            c["writeIn"] = True
        if note:
            c["note"] = note
        if website:
            c["website"] = website
        out.append(c)
    return out


def parse_recommendation_race(rec_text, candidates):
    t = rec_text.strip()
    low = t.lower()
    if low == "uncontested":
        return {"_type": "recommendation", "kind": "uncontested"}
    if "abstain" in low:
        return {"_type": "recommendation", "kind": "abstain", "label": t}
    if low in ("no recommendation", "no endorsement", "undecided", "tbd"):
        return {"_type": "recommendation", "kind": "none"}
    # match a candidate by last name
    last = t.split()[-1].lower().strip(".,")
    for c in candidates:
        if last in c["name"].lower():
            return {"_type": "recommendation", "kind": "candidate", "candidateKey": c["_key"], "candidateName": c["name"]}
    return {"_type": "recommendation", "kind": "candidate", "candidateName": t}


def parse_recommendation_measure(rec_text):
    t = rec_text.strip()
    low = t.lower().replace("!", "")
    kind = "none"
    if low in ("hell no", "fuck no", "absolutely not"):
        kind = "strongNo"
    elif low.startswith("no"):
        kind = "no"
    elif low in ("hell yes", "fuck yes", "absolutely"):
        kind = "strongYes"
    elif low.startswith("yes"):
        kind = "yes"
    rec = {"_type": "recommendation", "kind": kind}
    if kind in ("strongNo", "strongYes") or (kind in ("no", "yes") and low not in ("no", "yes")):
        rec["label"] = t
    return rec


def parse_recommendation_judge(rec_text):
    low = rec_text.strip().lower()
    if "not" in low or "don" in low:
        return {"_type": "recommendation", "kind": "doNotRetain"}
    if "retain" in low:
        return {"_type": "recommendation", "kind": "retain"}
    return {"_type": "recommendation", "kind": "none"}


docs = []
election_id = f"election-{SLUG}"
election = {
    "_id": election_id,
    "_type": "election",
    "title": " ".join(title_lines) or "Election Guide",
    "subtitle": " ".join(subtitle_lines),
    "slug": {"_type": "slug", "current": SLUG},
    "date": DATE,
    "status": "live",
    "shareUrl": share_link,
    "intro": [],
    "methodology": [],
    "helpItems": [],
}
docs.append(election)

section_order = 0
item_order = 0


def add_section(category, title, desc_paras):
    global section_order
    section_order += 1
    sid = f"section-{SLUG}-{slugify(title)}"
    docs.append({
        "_id": sid,
        "_type": "section",
        "title": title,
        "slug": {"_type": "slug", "current": slugify(title)},
        "category": category,
        "order": section_order,
        "election": {"_type": "reference", "_ref": election_id},
        "description": blocks(desc_paras, f"sec-{sid}"),
    })
    return sid


def add_race(sid, title, plist):
    global item_order
    item_order += 1
    parts = [x.strip() for x in re.split(r"\s+[-–—]\s+", title)]
    office = parts[0]
    district = parts[1] if len(parts) == 3 else None
    rec_text = parts[-1] if len(parts) >= 2 else ""
    labelled = split_by_labels(plist)
    candidates = parse_candidates(labelled.get("candidates", []))
    rec = parse_recommendation_race(rec_text, candidates) if rec_text else {"_type": "recommendation", "kind": "none"}
    slug = slugify(f"{office} {district or ''}")
    job = labelled.get("job", []) + labelled.get("lead", [])
    docs.append({
        "_id": f"race-{SLUG}-{slug}",
        "_type": "race",
        "title": office,
        "district": district,
        "slug": {"_type": "slug", "current": slug},
        "order": item_order,
        "election": {"_type": "reference", "_ref": election_id},
        "section": {"_type": "reference", "_ref": sid},
        "jobDescription": blocks(job, f"job-{slug}"),
        "candidates": candidates,
        "recommendation": rec,
        "deepDive": blocks(labelled.get("deep", []), f"deep-{slug}"),
    })


def add_judge(sid, title, plist):
    global item_order
    item_order += 1
    parts = [x.strip() for x in re.split(r"\s+[-–—]\s+", title)]
    name = parts[0]
    rec = parse_recommendation_judge(parts[-1] if len(parts) > 1 else "")
    slug = slugify(name)
    review = None
    for p in plist:
        for r in p.get("elements", []):
            url = r.get("textRun", {}).get("textStyle", {}).get("link", {}).get("url")
            if url and "yourmissourijudges.org/judges" in url:
                review = url
    docs.append({
        "_id": f"judge-{SLUG}-{slug}",
        "_type": "judge",
        "name": name,
        "slug": {"_type": "slug", "current": slug},
        "order": item_order,
        "election": {"_type": "reference", "_ref": election_id},
        "section": {"_type": "reference", "_ref": sid},
        "recommendation": rec,
        "reviewUrl": review,
        "deepDive": blocks([p for p in plist if para_text(p)], f"deep-{slug}"),
    })


def add_measure(sid, title, plist):
    global item_order
    item_order += 1
    parts = [x.strip() for x in re.split(r"\s+[-–—]\s+", title)]
    name = parts[0]
    rec = parse_recommendation_measure(parts[-1] if len(parts) > 1 else "")
    short = name
    m = re.match(r"(?:Constitutional\s+)?Amendment\s+(?:No\.?\s*)?(\d+)", name, re.I)
    if m:
        short = f"Amendment {m.group(1)}"
    m2 = re.match(r"Proposition\s+(\w+)", name, re.I)
    if m2:
        short = f"Prop {m2.group(1)}"
    slug = slugify(short)
    labelled = split_by_labels(plist)
    docs.append({
        "_id": f"measure-{SLUG}-{slug}",
        "_type": "measure",
        "title": name,
        "shortTitle": short,
        "slug": {"_type": "slug", "current": slug},
        "order": item_order,
        "election": {"_type": "reference", "_ref": election_id},
        "section": {"_type": "reference", "_ref": sid},
        "ballotLanguage": blocks(labelled.get("ballot", []), f"ballot-{slug}"),
        "recommendation": rec,
        "deepDive": blocks(labelled.get("deep", []) + labelled.get("lead", []), f"deep-{slug}"),
        "whosBehindIt": blocks(labelled.get("behind", []), f"behind-{slug}"),
    })


def looks_like_item(title):
    return bool(re.search(r"\s[-–—]\s", title))


for g in groups:
    h1 = g["title"].strip()
    low = h1.lower()
    if low in ("don’t skip this", "don't skip this", "intro", "introduction"):
        lead, h2s = split_by_heading(g["paras"], 2)
        election["intro"] = blocks(lead, "intro")
        for h2 in h2s:
            t = h2["title"].lower()
            if "help" in t:
                hl, h3s = split_by_heading(h2["paras"], 3)
                election["helpIntro"] = blocks(hl, "help-intro")
                for i, h3 in enumerate(h3s):
                    # Bare-link paragraphs become action links. A doc H4 right
                    # before a bare link names it (e.g. "Keri Ingle - Senate 8th").
                    links, body_paras, pending_label = [], [], None
                    for p in h3["paras"]:
                        txt = para_text(p)
                        if not txt:
                            continue
                        urls = [r.get("textRun", {}).get("textStyle", {}).get("link", {}).get("url") for r in p.get("elements", [])]
                        urls = [u for u in urls if u]
                        linked_text = "".join(r["textRun"]["content"] for r in p.get("elements", []) if r.get("textRun", {}).get("textStyle", {}).get("link")).strip()
                        is_bare_link = len(set(urls)) == 1 and linked_text and len(linked_text) >= len(txt) - 2
                        if heading_level(p):
                            pending_label = txt
                            continue
                        if is_bare_link:
                            url = urls[0]
                            if pending_label:
                                label = pending_label
                            elif re.match(r"^https?://", linked_text):
                                host = re.sub(r"^https?://(www\.)?", "", linked_text).split("/")[0]
                                label = host
                            else:
                                label = linked_text
                            links.append({"_type": "linkItem", "_key": key("hl", i, url, len(links)), "label": label, "url": url})
                            pending_label = None
                            continue
                        if pending_label:
                            # heading without a link under it: keep as a sub-heading in the body
                            body_paras.append(_heading_para(pending_label))
                            pending_label = None
                        body_paras.append(p)
                    election["helpItems"].append({
                        "_type": "helpItem",
                        "_key": key("help", SLUG, h3["title"]),
                        "title": h3["title"],
                        "body": blocks(body_paras, f"help-{i}"),
                        "links": links,
                    })
            elif "about" in t or "method" in t:
                election["methodology"] = blocks(h2["paras"], "method")
            else:
                election["intro"] += [
                    {"_type": "block", "_key": key("h", h2["title"]), "style": "h3", "markDefs": [], "children": [{"_type": "span", "_key": key("hs", h2["title"]), "text": h2["title"], "marks": []}]}
                ] + blocks(h2["paras"], f"intro-{slugify(h2['title'])}")
        continue

    category = CATEGORY_BY_H1.get(low)
    if not category:
        # guess
        if "judge" in low or "court" in low:
            category = "judges"
        elif "ballot" in low or "amendment" in low or "question" in low:
            category = "ballot"
        elif "county" in low:
            category = "county"
        elif "city" in low or "council" in low or "mayor" in low:
            category = "city"
        elif "school" in low:
            category = "schools"
        elif "state" in low:
            category = "state"
        elif "federal" in low or "congress" in low:
            category = "federal"
        else:
            category = "other"

    add_item = {"judges": add_judge, "ballot": add_measure}.get(category, add_race)

    lead, h2s = split_by_heading(g["paras"], 2)
    if not h2s:
        # No H2: category itself is the section; H3s are items
        lead3, h3s = split_by_heading(lead, 3)
        sid = add_section(category, h1, lead3)
        for h3 in h3s:
            add_item(sid, h3["title"], h3["paras"])
        continue

    if lead and any(para_text(p) for p in lead):
        # stray intro text under H1 before first H2 -> keep as section description of first H2? attach to election notes
        pass

    for h2 in h2s:
        h2_lead, h3s = split_by_heading(h2["paras"], 3)
        if not h3s and looks_like_item(h2["title"]) and category not in ("judges",):
            # H2 is itself an item (e.g. "State Auditor - Quentin Wilson")
            office = re.split(r"\s+[-–—]\s+", h2["title"])[0].strip()
            labelled = split_by_labels(h2_lead)
            sid = add_section(category, office, labelled.get("job", []))
            # remove job paras from item body
            rest = [p for p in h2_lead if p not in labelled.get("job", [])]
            add_item(sid, h2["title"], rest)
            continue
        labelled = split_by_labels(h2_lead)
        desc = labelled.get("job", []) + labelled.get("lead", [])
        sid = add_section(category, h2["title"], desc)
        for h3 in h3s:
            add_item(sid, h3["title"], h3["paras"])

# If a section has no description but its first item carries a job description, hoist it.
for sec in [d for d in docs if d["_type"] == "section"]:
    if sec["description"]:
        continue
    items = sorted([d for d in docs if d["_type"] == "race" and d["section"]["_ref"] == sec["_id"]], key=lambda d: d["order"])
    if items and items[0].get("jobDescription"):
        sec["description"] = items[0]["jobDescription"]
        items[0]["jobDescription"] = []

# Site settings (editable later in Studio)
docs.insert(0, {
    "_id": "siteSettings",
    "_type": "siteSettings",
    "siteTitle": election["title"],
    "tagline": "A progressive's guide to voting in Kansas City, Missouri",
    "authorName": "Brynne Musser",
    "instagram": "itspurplemink",
    "contactEmail": "brynne.musser@gmail.com",
    "jurisdiction": "Kansas City, Missouri",
})

json.dump(docs, sys.stdout, ensure_ascii=False, indent=2)

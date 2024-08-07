import { computePartialLayout, headingsMatch } from "../../lib/layout";
const { objectContaining } = expect;

describe("layout", () => {

    test("empty headings match", () => {
        expect(headingsMatch([], [])).toBe(true);
    });

    test("empty first heading doesn't match second heading", () => {
        expect(headingsMatch([], ["a"])).toBe(false);
    });

    test("empty second heading doesn't match first heading", () => {
        expect(headingsMatch(["a"], [])).toBe(false);
    });

    test("headings match", () => {
        expect(headingsMatch(["a"], ["a"])).toBe(true);
        expect(headingsMatch(["a", "b"], ["a", "b"])).toBe(true);
    });

    test("headings don't match", () => {
        expect(headingsMatch(["a"], ["b"])).toBe(false);
        expect(headingsMatch(["a", "b"], ["b", "a"])).toBe(false);
    });

    test("ragged headings don't match", () => {
        expect(headingsMatch(["a"], ["a", "b"])).toBe(false);
        expect(headingsMatch(["a", "b"], ["a"])).toBe(false);
    });

    test("an empty gallery returns an empty layout", () => {

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, [], galleryWidth, targetRowHeight);
        expect(layout.rows).toEqual([]);
    });

    test("can layout a gallery with a single item", () => {

        const item = {
            _id: 1,
            width: 140,
            height: 100,
        };

        const gallery: any[] = [ item ];

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, gallery, galleryWidth, targetRowHeight);
        expect(layout.rows.length).toBe(1);

        const row = layout.rows[0];
        expect(row.items.length).toBe(1);
        expect(row.items[0]._id).toBe(1);
    });

    test("can layout a gallery with multiple items", () => {

        const items: any[] = [
            {
                _id: 1,
                width: 100,
                height: 200,
            },
            {
                _id: 2,
                width: 100,
                height: 200,
            },
            {
                _id: 3,
                width: 100,
                height: 200,
            },
        ];

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, items, galleryWidth, targetRowHeight);
        expect(layout.rows.length).toBe(1);

        const row = layout.rows[0];
        expect(row.items.length).toBe(3);
        expect(row.items[0]._id).toBe(1);
        expect(row.items[1]._id).toBe(2);
        expect(row.items[2]._id).toBe(3);
    });

    test("items wrap to the next row on overflow", () => {

        const items: any[] = [
            {
                _id: 1,
                width: 140,
                height: 200,
            },
            {
                _id: 2,
                width: 100,
                height: 200,
            },
            {
                _id: 3,
                width: 400,
                height: 200,
            },
        ];

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, items, galleryWidth, targetRowHeight);
        expect(layout.rows.length).toBe(2);

        const firstRow = layout.rows[0];
        expect(firstRow.items.length).toBe(2);
        expect(firstRow.items[0]._id).toBe(1);
        expect(firstRow.items[1]._id).toBe(2);

        const secondRow = layout.rows[1];
        expect(secondRow.items.length).toBe(1);
        expect(secondRow.items[0]._id).toBe(3);
    });    

    test("items not in the last row are stretched toward the right hand boundary of the gallery", () => {

        const items: any[] = [
            {
                width: 240,
                height: 200,
            },
            {
                width: 220,
                height: 200,
            },
            {
                width: 230,
                height: 200,
            },
        ];

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, items, galleryWidth, targetRowHeight);
        const firstRow = layout.rows[0];
        expect(firstRow.items.length).toBe(2);
        expect(firstRow.height).toBeGreaterThan(targetRowHeight);

        const item1 = firstRow.items[0];
        expect(item1.thumbWidth).toBeGreaterThan(items[0].width);
        expect(item1.thumbHeight).toBeGreaterThan(items[0].height);

        const item2 = firstRow.items[1];
        expect(item2.thumbWidth).toBeGreaterThan(items[1].width);
        expect(item2.thumbHeight).toBeGreaterThan(items[1].height);

        const secondRow = layout.rows[1];
        expect(secondRow.items.length).toBe(1);
        expect(secondRow.height).toBeCloseTo(targetRowHeight);

        const item3 = secondRow.items[0];
        expect(item3.thumbWidth).toBeCloseTo(items[2].width);
        expect(item3.thumbHeight).toBeCloseTo(items[2].height);
        
    });

    test("items with a different group wrap to the next row", () => {

        const items: any[] = [
            {
                _id: 1,
                width: 100,
                height: 200,
                headings: [ "a" ],
            },
            {
                _id: 2,
                width: 100,
                height: 200,
                headings: [ "b" ],
            },
            {
                _id: 3,
                width: 100,
                height: 200,
                headings: [ "b" ],
            },
        ];

        const galleryWidth = 600;
        const targetRowHeight = 200;
        const layout = computePartialLayout(undefined, items, galleryWidth, targetRowHeight);
        
        expect(layout.rows.length).toBe(4);
        expect(layout.rows[0]).toEqual(objectContaining({ 
            type: "heading",
            headings: [ "a" ],
        }));
        expect(layout.rows[1].items.length).toEqual(1);
        expect(layout.rows[2]).toEqual(objectContaining({ 
            type: "heading",
            headings: [ "b" ],
        }));
        expect(layout.rows[3].items.length).toEqual(2);
    });
});
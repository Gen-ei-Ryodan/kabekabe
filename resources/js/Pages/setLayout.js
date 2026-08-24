export default function setLayout(Page, Layout) {
    Page.layout = (page) => <Layout>{page}</Layout>;

    return Page;
}
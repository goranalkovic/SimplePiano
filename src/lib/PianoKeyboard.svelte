<script>
    import BlackKey from "./BlackKey.svelte";
    import WhiteKey from "./WhiteKey.svelte";
</script>

<div class="h-48 p-0 m-0 select-none piano-grid">
    <div class="white-keys flex gap-px w-max h-max z-[1]">
        <WhiteKey keyId={20} />
        <WhiteKey keyId={65} />
        <WhiteKey keyId={83} />
        <WhiteKey keyId={68} />
        <WhiteKey keyId={70} />
        <WhiteKey keyId={71} />
        <WhiteKey keyId={72} />
        <WhiteKey keyId={74} />
        <WhiteKey keyId={75} />
        <WhiteKey keyId={76} />
        <WhiteKey keyId={186} />
        <WhiteKey keyId={222} />
        <WhiteKey keyId={220} />
        <WhiteKey keyId={13} />
        <WhiteKey keyId={46} />
        <WhiteKey keyId={35} />
        <WhiteKey keyId={34} />
        <WhiteKey keyId={103} />
        <WhiteKey keyId={104} />
        <WhiteKey keyId={105} />
        <WhiteKey keyId={107} />
    </div>
    <div class="black-keys mx-4.5 flex gap-px mb-auto z-[2]">
        <BlackKey keyId={81} />
        <BlackKey keyId={87} />
        <BlackKey keyId={69} />
        <BlackKey dummy />
        <BlackKey keyId={84} />
        <BlackKey keyId={90} />
        <BlackKey dummy />
        <BlackKey keyId={73} />
        <BlackKey keyId={79} />
        <BlackKey keyId={80} />
        <BlackKey dummy />
        <BlackKey keyId={221} />
        <BlackKey keyId={8} />
        <BlackKey dummy />
        <BlackKey keyId={45} />
        <BlackKey keyId={36} />
        <BlackKey keyId={33} />
        <BlackKey dummy />
        <BlackKey keyId={111} />
        <BlackKey keyId={106} />
    </div>
</div>

<style global>
    .piano-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
    }

    .white-keys {
        grid-column: 1;
        grid-row: 1 / 2;
    }

    .black-keys {
        grid-column: 1;
        grid-row: 1;
    }
</style>
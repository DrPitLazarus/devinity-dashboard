<template>
    <div class="gamemode-table">
        <table class="table is-narrow is-fullwidth">
            <tbody>
                <tr v-for="pair of data" :key="pair[0]">
                    <th>{{ pair[0] }}</th>
                    <td>{{ pair[1] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        data: Array
    }
}
</script>

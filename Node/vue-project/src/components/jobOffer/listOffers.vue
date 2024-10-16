<script setup>
import { ref } from 'vue';
const listItems = ref([]);
async function getData() {
    const res = await fetch("http://localhost:3000/api/jobOffers");
    const finalRes = await res.json();
    listItems.value = finalRes;
    listItems.value = listItems._rawValue[0];
}
getData()
</script>
<template>
    <div>
        <h1> Liste des jobOffers </h1>
        <table border="1">
            <thead>
                <tr>
                    <th scope="col">Number</th>
                    <th scope="col">JobSheet</th>
                    <th scope="col">State</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in listItems">
                    <td>{{ item.number }}</td>
                    <td>{{ item.jobSheet }}</td>
                    <td>{{ item.state }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

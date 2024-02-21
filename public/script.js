new DataTable("#noder", {
    lengthMenu: [
        [10, 25, 50, -1],
        [10, 25, 50, 'Alle']
    ],
    columnDefs: [
        { orderable: false , targets: 5 }
    ],
    "language": {
        "lengthMenu": "Vis _MENU_ emner per side",
        "zeroRecords": "Ingen emner fundet",
        "info": "Viser side _PAGE_ af _PAGES_",
        "infoEmpty": "Ingen emner fundet",
        "infoFiltered": "(Filtreret fra _MAX_ emner i alt)",
        "search": "",
        "searchPlaceholder": "Søg efter nummer, komponist eller titel",
        "paginate": {
            "first":      "Første",
            "last":       "Sidste",
            "next":       "Næste",
            "previous":   "Forrige"
        },
    }
});

async function mark(i) {
    const res = await fetch("/mark", {
        method: "POST",
        headers: {'Content-Type': 'application/JSON'},
        body: JSON.stringify({id: i})
    })
    let e = await res.json()
    document.getElementById(`tr${e.id}`).style.backgroundColor = (e.ude === 1) ? "rgb(255, 148, 148)" : "whitesmoke";
}

async function del(i) {
    if(!confirm("Er du sikker på at du vil slette emnet?")){
        return;
    }
    const res = await fetch("/del", {
        method: "POST",
        headers: {'Content-Type': 'application/JSON'},
        body: JSON.stringify({id: i})
    })
    if (res.ok) {
        location.reload();
    } else {
        console.error("Error deleting item:", res.status, res.statusText);
        alert("Fejl");
    }
}
import { deleteManagedRecord, listManagedRecords, updateManagedRecord } from "./managedDataService.js";

export const listContactRequests = () => listManagedRecords("requests");
export const updateContactRequest = (id, payload) => updateManagedRecord("requests", id, payload);
export const deleteContactRequest = (id) => deleteManagedRecord("requests", id);

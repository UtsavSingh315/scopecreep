"use client";

export const Columns = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "route",
    header: "Route",
    cell: ({ row }) => {
      const route = row.getValue("route");
      return (
        <a
          href={route}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300">
          {route}
        </a>
      );
    },
  },
  {
    accessorKey: "info",
    header: "Info",
  },
];

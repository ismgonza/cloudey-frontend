import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';

function ServicesSummaryTable({ data, monthNames }) {
  const [sorting, setSorting] = useState([{ id: 'month_2', desc: true }]);
  const [expanded, setExpanded] = useState({});

  const getTrendIcon = (direction) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (color) => {
    if (color === 'green') return 'text-green-600 bg-green-50';
    if (color === 'red') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const columns = [
    {
      id: 'expander',
      header: '',
      cell: ({ row }) => {
        // Only show expander if there are resources
        if (!row.original.top_resources || row.original.top_resources.length === 0) {
          return null;
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        );
      },
      size: 40,
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue()}</span>
      ),
    },
    {
      id: 'month_0',
      header: () => monthNames[0] || 'Month 1',
      accessorFn: (row) => row.months[0],
      cell: ({ getValue }) => (
        <span className="text-gray-700">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      id: 'month_1',
      header: () => monthNames[1] || 'Month 2',
      accessorFn: (row) => row.months[1],
      cell: ({ getValue }) => (
        <span className="text-gray-700">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      id: 'month_2',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1 hover:text-gray-900"
        >
          {monthNames[2] || 'Month 3'}
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      accessorFn: (row) => row.months[2],
      cell: ({ getValue }) => (
        <span className="font-semibold text-gray-900">${getValue()?.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'change_pct',
      header: 'MoM',
      cell: ({ row }) => {
        const { change_pct, direction, color } = row.original;
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getTrendColor(color)}`}>
            {getTrendIcon(direction)}
            <span className="font-medium">
              {change_pct > 0 ? '+' : ''}{change_pct}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'pct_of_total',
      header: '% of Total',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-700">{getValue()}%</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${getValue()}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.top_resources && row.original.top_resources.length > 0,
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No service data available
        </div>
      ) : (
        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 text-sm font-semibold text-gray-700 bg-gray-50"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <>
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      idx < 3 ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr key={`${row.id}-expanded`}>
                      <td colSpan={columns.length} className="bg-blue-50/20 p-0">
                        <div className="px-12 py-4 overflow-x-auto">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Top 10 Resources in {row.original.service}
                          </h4>
                          <table className="w-full min-w-max">
                            <thead>
                              <tr className="border-b border-blue-200">
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">Resource</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">Compartment</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[0]}</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[1]}</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">{monthNames[2]}</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-600">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.original.top_resources.map((resource, idx) => (
                                <tr key={idx} className="border-b border-blue-100">
                                  <td className="py-2 px-4 text-sm text-gray-700 font-mono text-xs">
                                    {resource.resource_name}
                                  </td>
                                  <td className="py-2 px-4 text-sm text-gray-600">
                                    {resource.compartment_name}
                                  </td>
                                  <td className="py-2 px-4 text-sm text-gray-600">
                                    ${resource.months[0]?.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-4 text-sm text-gray-600">
                                    ${resource.months[1]?.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-4 text-sm text-gray-600">
                                    ${resource.months[2]?.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-4 text-sm font-semibold text-gray-900">
                                    ${resource.total_cost?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ServicesSummaryTable;

